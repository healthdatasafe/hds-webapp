import type { pryv as Pryv } from 'hds-lib-js';
import HDSLib from 'hds-lib-js';


interface DisplayInfo {
  key: string,
  content: string
}

export default class Contact {
  id: string;
  displayName: string;
  displayInfos: DisplayInfo[];
  accessData?: Pryv.Access;
  collectorClient?: HDSLib.appTemplates.CollectorClient;
  avatarUrl?: string;

  constructor (access?: Pryv.Access) {
    this.accessData = access;
    this.id = access?.id;
    this.displayName = access?.name;

    this.displayInfos = [];
    if (access?.type) {
      this.displayInfos.push({
        key: 'Type',
        content: access.type,
        });
    }
  }

  static createFromCollectorClients(cClient: HDSLib.appTemplates.CollectorClient) {
    const contact = new Contact();
    contact.id = cClient.key;
    contact.accessData = cClient.accessData;
    const formTitle = HDSLib.l(cClient.requestData.title);
    contact.displayName = cClient.requestData.requester.name + ' - ' + formTitle;
    contact.collectorClient = cClient;
    contact.displayInfos = [{
      key: 'Status',
      content: cClient.status,
    }, {
      key: 'Description',
      content: HDSLib.l(cClient.requestData.description)
    }, {
      key: 'Consent',
      content: HDSLib.l(cClient.requestData.consent)
    }];
    return contact;
  }
}