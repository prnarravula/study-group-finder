import React, { useState, useEffect, useCallback, useContext } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';

export default function IndChatScreen({ route }) {
  const { chatId } = route.params;
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);

  /* live listener */
  useEffect(() => {
    const ref = collection(db, 'chats', chatId, 'messages');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) =>
      setMessages(
        snap.docs.map((d) => {
          const m = d.data();
          return {
            _id: d.id,
            text: m.text,
            createdAt: m.createdAt.toDate(),
            user: { _id: m.senderId, name: m.senderName },
          };
        })
      )
    );
  }, [chatId]);

  /* send */
  const onSend = useCallback(
    async (newMsgs = []) => {
      const m = newMsgs[0];
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: m.text,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, 'chats', chatId),
        {
          lastMsg: m.text,
          lastSender: user.displayName || '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [chatId, user]
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{ _id: user.uid, name: user.displayName }}
      placeholder="Type a message…"
      renderUsernameOnMessage
    />
  );
}
