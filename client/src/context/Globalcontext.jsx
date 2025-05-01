import { createContext, useContext, useReducer, useEffect } from "react";

const GlobalStateContext = createContext();

const initialState = {
  user: null,
  image: null,
  imageURL: null,
  symptoms: "",
  diagnosis: null,
  chatHistory: [],
  doctorData: null,
  screenWidth: window.innerWidth,
  activeSession: null,
  sharedChat: JSON.parse(localStorage.getItem("sharedChat")) || [],
  physicianRequest: null,
  physicianButtonState: "disconnected",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_IMAGE":
      return { ...state, image: action.payload };
    case "SET_IMAGE_URL":
      return { ...state, imageURL: action.payload };
    case "SET_SYMPTOMS":
      return { ...state, symptoms: action.payload };
    case "SET_DIAGNOSIS":
      return { ...state, diagnosis: action.payload };
    case "ADD_MESSAGE":
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case "SET_DOCTOR_DATA":
      return { ...state, doctorData: action.payload };
    case "SET_SCREEN_WIDTH":
      return { ...state, screenWidth: action.payload };
    case "SET_SESSION":
      return { ...state, activeSession: action.payload };
    case "RESET_CHAT":
      return { ...state, chatHistory: [] };
    case "UPDATE_MESSAGE_TEXT":
      return {
        ...state,
        chatHistory: state.chatHistory.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, text: action.payload.text }
            : msg
        ),
      };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        chatHistory: state.chatHistory.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    case "REMOVE_MESSAGE":
      return {
        ...state,
        chatHistory: state.chatHistory.filter(
          (msg) => msg.id !== action.payload
        ),
      };
    case "ADD_SHARED_MESSAGE":
      const newSharedChat = [
        ...state.sharedChat,
        {
          ...action.payload,
          senderType: action.payload.sender === "doctor" ? "doctor" : "patient",
        },
      ];
      localStorage.setItem("sharedChat", JSON.stringify(newSharedChat));
      return { ...state, sharedChat: newSharedChat };
    case "CLEAR_SHARED_CHAT":
      localStorage.removeItem("sharedChat");
      return { ...state, sharedChat: [] };
    case "REQUEST_PHYSICIAN":
      return {
        ...state,
        physicianRequest: {
          status: "pending",
          timestamp: new Date().toISOString(),
        },
      };
    case "PHYSICIAN_CONNECTED":
      return {
        ...state,
        physicianRequest: {
          status: "connected",
          timestamp: new Date().toISOString(),
        },
      };
    case "UPDATE_PHYSICIAN_BUTTON":
      return { ...state, physicianButtonState: action.payload };

    default:
      return state;
  }
}

const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const handleResize = () => {
      dispatch({ type: "SET_SCREEN_WIDTH", payload: window.innerWidth });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

export default GlobalStateProvider;
