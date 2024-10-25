import Vuex from 'vuex';

interface State {
  roomCode: string | null;
  watcherId: string | null;
}

export default new Vuex.Store<State>({
  state: {
    roomCode: null,
    watcherId: null,
  },
  mutations: {
    setRoomCode(state, code: string) {
      state.roomCode = code;
    },
    setWatcherId(state, id: string) {
      state.watcherId = id;
    },
    clearRoomData(state) {
      state.roomCode = null;
      state.watcherId = null;
    },
  },
  actions: {
    updateRoomCode({ commit }, code: string) {
      commit('setRoomCode', code);
    },
    updateWatcherId({ commit }, id: string) {
      commit('setWatcherId', id);
    },
    clearRoomData({ commit }) {
      commit('clearRoomData');
    },
  },
  getters: {
    getRoomCode(state): string | null {
      return state.roomCode;
    },
    getWatcherId(state): string | null {
      return state.watcherId;
    },
  },
});
