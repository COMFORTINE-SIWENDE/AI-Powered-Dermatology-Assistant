import { createContext, useState } from "react";

export const Globalstate = createContext(null);

function Globalcontext({ children }) {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  return (
    <Globalstate value={{ image, setImage, imageURL, setImageURL }}>
      {children}
    </Globalstate>
  );
}

export default Globalcontext;
