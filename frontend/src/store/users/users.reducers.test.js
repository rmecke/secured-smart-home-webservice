import roomsReducers from "./users.reducers";
import { fetchRoomsSuccess } from "./users.actions";

describe("Rooms Reducers testing", () => {
    
  it("should add new rooms if success action is fired", () => {
    const state = { rooms: {} };
    const payload = { roomId: "room1" };
    const newState = roomsReducers(state, fetchRoomsSuccess(payload));
    expect(newState).toMatchObject({ rooms: { roomId: "room1" } });
  });
});
