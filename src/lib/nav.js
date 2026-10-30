import { Bell, Compass, Home, MessageCircle, User } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", short: "Home", icon: Home, end: true },
  { to: "/explore", label: "Explore", short: "Explore", icon: Compass },
  { to: "/notifications", label: "Notifications", short: "Alerts", icon: Bell, badge: "notes" },
  { to: "/messages", label: "Messages", short: "Inbox", icon: MessageCircle, badge: "messages" },
  { to: "/profile", label: "Profile", short: "Profile", icon: User },
];
