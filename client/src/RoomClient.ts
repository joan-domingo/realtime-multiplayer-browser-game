import { Room } from "colyseus.js";

export class RoomClient {
  private roomInstance: Room | undefined;

  setRoomInstance(room: Room) {
    this.roomInstance = room;
  }

  getRoomInstance() {
    return this.roomInstance;
  }
}
