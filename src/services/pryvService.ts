
import 'https://pryv.github.io/lib-js/pryv-socket.io-monitor.js';


export interface PryvServiceConfig {
  serviceInfoUrl: string;
  appId: string;
  language?: string;
  origin?: string;
}

class PryvService {
  private config: PryvServiceConfig;
  private pryvConnection: Connection = null;
  private service: Service = null;
  private monitor: any = null;
  events = [];
  
  constructor(config: PryvServiceConfig) {
    this.config = config;
    this.service = new Pryv.Service(this.config.serviceInfoUrl);
  }

  async newEvent(event) {
    console.log(event);
    this.events.push(event);
  }

  private async setMonitor() {
    if (this.monitor) this.monitor.stop();
    if (!this.pryvConnection) return;
    const eventsGetScope = {};

   // await this.pryvConnection.getEventsStreamed(eventsGetScope, this.newEvent.bind(this))
    
    this.monitor = new Pryv.Monitor(this.pryvConnection, eventsGetScope)
      .on('event', (event) => { this.newEvent(event); }) // event created or updated
      .on('streams', (streams) => { console.log('s >> ', streams)}) // streams structure changed
      .on('eventDelete', (event) => { console.log('d >> ', event)}) // event deleted
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
      console.log('Authicated with existing apiEndpoint');
      this.setMonitor();
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
      this.setMonitor();
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
