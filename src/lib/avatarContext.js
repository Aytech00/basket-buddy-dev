import React, { useState, createContext, useEffect } from "react";
import { supabase } from "./supabase";

export const AvatarContext = createContext([]);

export const AvatarProvider = ({ children }) => {
  const [avatar, setAvatarUrl] = useState();

  // Your function
  const retrieveUserSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) console.log(error.message);

    if (data) {
      return data.session.user.id;
    }

    return null;
  };

  async function handleAvatar(url) {
    const { data } = supabase.storage.from("avatars").getPublicUrl(url);

    setAvatarUrl(data.publicUrl);
  }

  useEffect(() => {
    (async function () {
      let id = await retrieveUserSession();
      const updateAvatarUrl = async () => {
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: avatar })
          .eq("id", id);

        if (error) {
          console.error(error);
        }
      };
      updateAvatarUrl();
    })();
  }, [avatar]);

  useEffect(() => {
    (async function () {
      let id = await retrieveUserSession();
      if (!id) {
        return;
      }
      let url = `${id}/profile.jpg`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .getPublicUrl(url);

      if (error) {
        console.log("Error getting public URL:", error);
      } else {
        setAvatarUrl(data.publicUrl);
      }
    })();
  }, []); // Empty dependency array so this useEffect runs once on component mount

  return (
    <AvatarContext.Provider value={{ handleAvatar, avatar }}>
      {children}
    </AvatarContext.Provider>
  );
};
