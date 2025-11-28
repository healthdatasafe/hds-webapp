import type { pryv as Pryv } from 'hds-lib-js';
import HDSLib from 'hds-lib-js';
import HDSItemDef from 'hds-lib-js/types/HDSModel/HDSItemDef';


interface DisplayInfo {
  key: string,
  content: string
}

export default class ChatItem {
  id: string;
  event: Pryv.Event;
  title: string;
  description: string;
  time: number;
  itemDef?: HDSItemDef;
  type: 'string' | 'keyValue';
  content: any;

  /**
   * @private
   * Do not use.. get chatItems with ChatItem.fromEvent(e);
   * @param event 
   */
  constructor(event: Pryv.Event) {
    this.id = event.id;
    this.event = event;
    this.title = 'stremId: ' + event.streamId;
    this.description = 'type: ' + event.type;
    this.time = event.time;
    this.type = 'string';
    this.content = JSON.stringify(event.content, null, 2); 
  }

  static fromEvent(event: Pryv.Event) {
    if (ignore(event)) return null;
    const chatItem = new ChatItem(event);

    // is an event in HDS Model
    const itemDef = HDSLib.getHDSModel().itemsDefs.forEvent(event, false);
    if (itemDef) {
      chatItem.title = itemDef.label;
      chatItem.description = itemDef.description;
      chatItem.content = getContentForEvent(event, itemDef);
      return chatItem;
    }

    // is a collector-client-request
    if (event.type === 'request/collector-client-v1') {
      const request = event.content.requesterEventData.content;
      chatItem.title = 'Request for connection';
      chatItem.description = HDSLib.l(request.title);
      chatItem.type = 'keyValue';
      chatItem.content = {
        'From': request.requester.name,
        'Info': HDSLib.l(request.description),
        'Status': event.content.status
      }
    }
    return chatItem;
  }
}

// filter unwanted events
function ignore(event: Pryv.Event) {
  if (! event) return true;
  if (event.streamIds[0].startsWith(':_')) return true;
  return false;
}

// 
function getContentForEvent(event: Pryv.Event, itemDef: HDSItemDef) {
  let content: string = event.content;
  const type = itemDef.data.type;
 
  if (type === 'select') {
    content = event.content;
    let valueForSelect = event.content;
    if (event.type === 'ratio/generic') {
      content = event.content.value + '/' + event.content.relativeTo;
      valueForSelect = event.content.value;
    }
    const selected = itemDef.data.options.find((o) => o.value === valueForSelect);
    content = selected != null ? HDSLib.l(selected.label) : '-';
  }
  if (type === 'checkbox') {
    if (event.type === 'activity/plain') {
      content = 'Yes';
    }
  }
  if (event.streamId === 'body-weight' && event.type.startsWith('mass/')) {
    const units = event.type.split('/').pop();
    content = `${content} ${units}`;
  }
  return content;
}
