import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { unreadCount: 0 },
  reducers: {
    setUnreadCount(state, action) { state.unreadCount = action.payload; },
    decrementUnread(state)        { if (state.unreadCount > 0) state.unreadCount--; },
    clearUnread(state)            { state.unreadCount = 0; },
  },
});

export const { setUnreadCount, decrementUnread, clearUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
