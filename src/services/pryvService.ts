
import 'https://pryv.github.io/lib-js/pryv-socket.io-monitor.js';

export interface PryvServiceConfig {
  serviceInfoUrl: string;
  appId: string;
  language?: string;
  origin?: string;
}

class PryvService {
  private config: PryvServiceConfig;
  private pryvConnection: any = null; // Using any to avoid TypeScript errors
  private service: any = null;
  private monitor: any = null;
  events: any[] = [];
  
  constructor(config: PryvServiceConfig) {
    this.config = config;
    this.service = new Pryv.Service(this.config.serviceInfoUrl);
  }

  async newEvent(event: any) {
    console.log('New event received:', event);
    // Check if the event already exists in the array
    const existingIndex = this.events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      // Update existing event
      this.events[existingIndex] = event;
    } else {
      // Add new event
      this.events.push(event);
    }
  }

  private async setMonitor() {
    if (this.monitor) this.monitor.stop();
    if (!this.pryvConnection) return;
    const eventsGetScope = {};

    // First, try to get existing events
    try {
      const result = await this.pryvConnection.api([{
        method: 'events.get',
        params: {}
      }]);
      
      if (result[0] && !result[0].error && result[0].events) {
        result[0].events.forEach((event: any) => this.newEvent(event));
      }
    } catch (error) {
      console.error('Error fetching initial events:', error);
    }
    
    this.monitor = new Pryv.Monitor(this.pryvConnection, eventsGetScope)
      .on('event', (event: any) => { this.newEvent(event); }) // event created or updated
      .on('streams', (streams: any) => { console.log('Streams updated:', streams)}) // streams structure changed
      .on('eventDelete', (event: any) => { 
        console.log('Event deleted:', event);
        // Remove the event from our array
        this.events = this.events.filter(e => e.id !== event.id);
      }) 
      .addUpdateMethod(new Pryv.Monitor.UpdateMethod.Socket()); // set refresh timer

    await this.monitor.start();
  }

  // authenticate with an existing api endpoint
  async authenticateWithEndpoint(apiEndpoint: string) {
    try {
      const potentialConnection = new Pryv.Connection(apiEndpoint);

      // test if connection is valid 
      const infos: any = await potentialConnection.accessInfo();
      console.log('HDS accessInfo:', infos);
      if (infos.error) {
        throw new Error('Failed validating existing user');
      }
      this.pryvConnection = potentialConnection;
      console.log('Authenticated with existing apiEndpoint');
      await this.setMonitor();
      return this.pryvConnection;
    } catch (error) {
      console.error('HDS authentication error:', error);
      throw error;
    }
  }
  
  // Initialize Pryv connection with auth
  async authenticate(username: string, password: string) {
    try {
      // In a real implementation, we would use HDS's proper authentication flow
      // This is a simplified version that creates a mock connection
      console.log('Authenticating with HDS with config:', this.config);

      // check service
      const serviceInfo = await this.service.info();
      console.log('Service Infos', serviceInfo);
      
      // Create a service object according to HDS docs
      this.pryvConnection = await this.service.login(username, password, this.config.appId);
      await this.setMonitor();
      return this.pryvConnection;
    } catch (error) {
      console.error('HDS authentication error:', error);
      throw error;
    }
  }
  
  // Store message in HDS
  async storeMessage(conversationId: string, message: any) {
    // In a real implementation, we would create events in HDS
    console.log(`Storing message in conversation ${conversationId}:`, message);
    
    // Return mock success response
    return {
      id: `hds-${Date.now()}`,
      success: true
    };
  }
  
  // Get messages from HDS
  async getMessages(conversationId: string) {
    // In a real implementation, we would get events from HDS
    console.log(`Getting messages for conversation ${conversationId}`);
    
    // Return mock messages
    return [];
  }

  // Get the conversation list
  async getContacts() {
    try {
      // Type the API call properly for TypeScript
      const accessesApiCall: any = {
        method: 'accesses.get',
        params: {}
      };
      
      const res = await this.pryvConnection.api([accessesApiCall]);
      if (res[0].error) {
        throw new Error(res[0].error.toString());
      }
      
      const accesses = res[0]?.accesses;
      console.log(accesses);
      
      // Map to our Contact interface
      const contacts = accesses.map((a: any) => ({
        id: a.id,
        username: a.name,
        displayName: a.name,
        type: a.type,
        status: 'online' as 'online' | 'offline' | 'away', // Cast to the union type
        accessInfo: a,
        // Map permissions from access if they exist
        permissions: a.permissions?.map((p: any) => ({
          name: p.streamId || 'Unknown',
          category: p.level.includes('read') ? 'data' : 'communication',
          actions: [p.level]
        }))
      }));
      
      return contacts;
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      throw error;
    }
  }
}

export default PryvService;
