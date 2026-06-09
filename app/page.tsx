'use client';

import { useChatContext } from '@/lib/ChatContext';
import ChatScreen from '@/components/screens/ChatScreen';
import ConfidenceViewScreen from '@/components/screens/ConfidenceViewScreen';
import DoubtLogScreen from '@/components/screens/DoubtLogScreen';

export default function HomePage() {
  const { state } = useChatContext();
  const { currentView } = state;

  return (
    <main style={{ height: '100vh', overflow: 'hidden' }}>
      {currentView === 'chat'       && <ChatScreen />}
      {currentView === 'confidence' && <ConfidenceViewScreen />}
      {currentView === 'doubt-log'  && <DoubtLogScreen />}
    </main>
  );
}
