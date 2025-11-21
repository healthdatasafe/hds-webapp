
import { HDService, pryv as Pryv} from 'hds-lib-js';

export interface APPServiceConfig {
  serviceInfoUrl: string;
  appId: string;
  language?: string;
  origin?: string;
}

class APPService {
  private config: APPServiceConfig;
  private hdsConnection: any = null; // Using any to avoid TypeScript errors
  private service: any = null;
  private monitor: any = null;
  events: any[] = [];
  private accesses = {}; // accesses cache by id 
  
  constructor(config: APPServiceConfig) {
    this.config = config;
    this.service = new HDService(this.config.serviceInfoUrl);
  }

  accessForId(id: string) {
    return this.accesses[id];
  }

  async newEvent(event: any) {
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

  private async setMonitorInitAccessesAndStreams() {
    if (this.monitor) this.monitor.stop();
    if (!this.hdsConnection) return;
    await this.getContacts(); // init accesses list (may be done asynchronusly)
    const eventsGetScope = {};

    // First, try to get existing events
    try {
      const result = await this.hdsConnection.api([{
        method: 'events.get',
        params: {}
      }]);
      
      if (result[0] && !result[0].error && result[0].events) {
        result[0].events.forEach((event: any) => this.newEvent(event));
      }
    } catch (error) {
      console.error('Error fetching initial events:', error);
    }
    
    this.monitor = new Pryv.Monitor(this.hdsConnection, eventsGetScope)
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
      this.hdsConnection = potentialConnection;
      console.log('Authenticated with existing apiEndpoint');
      await this.setMonitorInitAccessesAndStreams();
      return this.hdsConnection;
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
      this.hdsConnection = await this.service.login(username, password, this.config.appId);
      await this.setMonitorInitAccessesAndStreams();
      return this.hdsConnection;
    } catch (error) {
      console.error('HDS authentication error:', error);
      throw error;
    }
  }
  
  // Register a user
  async register(email: string, username: string, password: string) {
    const host = await geRegistrationHost(this.service);
    try {
      // create user
      const res = await Pryv.utils.superagent.post(host + 'users')
        .send({
          appId: this.config.appId,
          username,
          password,
          email,
          invitationtoken: 'enjoy',
          languageCode: this.config.language || 'en',
          referer: 'none'
        });
      if (res.body.apiEndpoint == null) throw new Error('Cannot find apiEndpoint in response');
      this.hdsConnection = new Pryv.Connection(res.body.apiEndpoint);
      this.setMonitorInitAccessesAndStreams();
      return this.hdsConnection;
    } catch (e) {
      throw new Error('Failed creating user ' + host + 'users');
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
      if (Object.keys(this.accesses).length === 0) {
        // Type the API call properly for TypeScript
        const accessesApiCall: any = {
          method: 'accesses.get',
          params: {}
        };
        
        const res = await this.hdsConnection.api([accessesApiCall]);
        if (res[0].error) {
          throw new Error(res[0].error.toString());
        }
        
        const accesses = res[0]?.accesses || [];
        for (const access of accesses) {
          this.accesses[access.id] = access;
        }
      }
      
      
      // Map to our Contact interface
      const contacts = Object.values(this.accesses).map((a: any) => ({
        id: a.id,
        username: a.name,
        displayName: a.name,
        type: a.type,
        status: 'online' as 'online' | 'offline' | 'away', // Cast to the union type
        accessInfo: a,
        // Map permissions from access if they exist
        permissions: a.permissions?.map((p: any) => ({
          name: p.streamId === '*' ? 'All strems' : p.streamId,
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

export default APPService;

/**
 * Not really usefull for Open-Pryv.io kept if entreprise version becoms availble
 * @returns {string} first available hosting
 */
async function geRegistrationHost (service) {
  const superagent = Pryv.utils.superagent;
  // get available hosting
  const serviceInfo = await service.info();
  const hostings = (await superagent.get(serviceInfo.register + 'hostings').set('accept', 'json')).body;
  let hostingCandidate = null;
  findOneHostingKey(hostings, 'N');
  function findOneHostingKey (o, parentKey) {
    for (const key of Object.keys(o)) {
      if (parentKey === 'hostings') {
        const hosting = o[key];
        if (hosting.available) {
          hostingCandidate = hosting;
        }
        return;
      }
      if (typeof o[key] !== 'string') {
        findOneHostingKey(o[key], key);
      }
    }
  }
  if (hostingCandidate == null) throw Error('Cannot find hosting in: ' + JSON.stringify(hostings));
  return hostingCandidate.availableCore;
}
