
import Pryv from 'pryv';

export interface PryvServiceConfig {
  serviceInfoUrl: string;
  appId: string;
  language?: string;
  origin?: string;
}

class PryvService {
  private config: PryvServiceConfig;
  private pryvConnection: any = null;
  private service: any = null;
  
  constructor(config: PryvServiceConfig) {
    this.config = config;
    this.service = new Pryv.Service(this.config.serviceInfoUrl);
  }

  // authenticate with an existing api endpoint
  async authenticateWithEndpoint(apiEndpoint: string) {
    try {
      const potentialConnection = new Pryv.Connection(apiEndpoint);

      // test if connection is valid 
      const infos = await potentialConnection.accessInfo();
      console.log('HDS accessInfo:', infos);
      if (infos.error) {
        throw new Error('Failed validating existing user');
      }
      this.pryvConnection = potentialConnection;
      
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
      
      // Create a service object according to HDS docs
      this.pryvConnection = await this.service.login(username, password, this.config.appId);
      
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
}

export default PryvService;
