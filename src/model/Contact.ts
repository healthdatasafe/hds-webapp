import type { pryv as Pryv } from 'hds-lib-js';

export default class Contact {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away';
  accessData?: Pryv.Access;
  permissions?: Pryv.Permission[];
  type?: string;
  phone?: string;
  organization?: string;

  constructor (access: Pryv.Access) {
    this.accessData = access;
    this.id = access.id;
    this.username = access.name;
    this.displayName = access.name;
    this.type = access.type;
    this.permissions = access.permissions;
  }
}