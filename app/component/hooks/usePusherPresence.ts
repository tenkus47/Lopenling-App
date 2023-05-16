import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { useRevalidator } from "@remix-run/react";
import { Store } from "react-notifications-component";

const usePusherPresence = (channelName, id, cluster, fetchUpdateText) => {
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [updateText, setUpdateText] = useState(false);
  const revalidator = useRevalidator();
  useEffect(() => {
    const pusher = new Pusher(id, {
      cluster,
      authEndpoint: "/auth/pusher", // Replace with your server's auth endpoint
    });
    const channel = pusher.subscribe(channelName);

    const handleSubscriptionSucceeded = () => {
      setOnlineMembers(Object.entries(channel.members.members));
    };

    const handleMemberAdded = (member) => {
      setOnlineMembers(Object.entries(channel.members.members));
      Store.addNotification({
        title: "Welcome!",
        message: member.info.username + " join",
        type: "success",
        insert: "top",
        container: "bottom-left",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true,
        },
      });
    };

    const handleMemberRemoved = (member) => {
      setOnlineMembers(Object.entries(channel.members.members));

      let userLeft = member.info.username;
      Store.addNotification({
        title: "Bye Bye!",
        message: userLeft + " went offline",
        type: "info",
        insert: "bottom",
        container: "bottom-left",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true,
        },
      });
    };
    const handleUpdate = (e) => {
      fetchUpdateText();
      if (channel.members.me.id !== e.user) {
        revalidator.revalidate();
      }
    };
    channel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
    channel.bind("pusher:member_added", handleMemberAdded);
    channel.bind("pusher:member_removed", handleMemberRemoved);

    channel.bind("update-app", handleUpdate);
    return () => {
      channel.unbind();
      pusher.unsubscribe(channelName);
    };
  }, [channelName]);

  return { onlineMembers, updateText };
};

export default usePusherPresence;
