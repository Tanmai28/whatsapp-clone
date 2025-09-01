import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect} from "react";
import ChatLIstItem from "./ChatLIstItem";
import ContactsList from "./ContactsList";

function List() {
  const [{userInfo,userContacts, filteredContacts},dispatch] = useStateProvider();

  useEffect(()=>{
    const getContacts = async() =>{
      try {
        const {
          data:{user,onlineUsers},
      } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
      dispatch({type:reducerCases.SET_ONLINE_USERS,onlineUsers});
      dispatch({type:reducerCases.SET_USER_CONTACTS,userContacts:user});
      } catch (err) {
        console.log(err);
      }
    };
    if(userInfo?.id)  getContacts();
  },[userInfo]);
  // useEffect(() => {
  //   console.log("Updated userContacts:", userContacts);
  // }, [userContacts]);
  

// return (  
//   <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
//     {filteredContacts && filteredContacts.length > 0 ? (
//       Array.isArray(userContacts) && userContacts.length > 0 ? (
//       userContacts.map((contact) => (
//         <ChatLIstItem data={contact} key={contact.id} />
//       ))
//     ) : (
//       <div className="text-center text-gray-400 mt-4">
//         No conversations yet.
//       </div>
//     )
//   ): null}
  
//   </div>
// );

// };


return (  
  <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
    {filteredContacts && filteredContacts.length > 0 ? (
      filteredContacts.map((contact) => (
        <ChatLIstItem data={contact} key={contact.id} />
      ))
    ) : (
      userContacts.map((contact) => (
                <ChatLIstItem data={contact} key={contact.id} />
      ))
    )}
  
  </div>
);

};


export default List;
