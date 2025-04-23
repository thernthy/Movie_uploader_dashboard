import { useState } from "react";
import Image from "next/image";
const AcategoryPopModel = () => {
  const [modal, setModal] = useState(false);

  const toggle = () => {
    setModal(!modal);
  };

  // const handleClick =(event)=>{
  //     let name = event.target.className;
  //     if(modal && name=='main'){
  //         toggle();
  //     }
  // }

  return (
    <>
      <div className="main">
        {!modal && (
          <button onClick={toggle} className="border:1 rounded-md">
            <h1>OPEN</h1>
          </button>
        )}
        {modal && (
          <div className="main">
            <div className="overlay h-1/3 w-9/12 rounded-md px-2 py-2 md:w-4/12">
              <div className="logo mb-1 flex w-full justify-center">
                <Image
                  src="https://cdn-icons-png.flaticon.com/128/7931/7931221.png"
                  alt=""
                  style={{ width: "10%", height: "auto" }}
                />
              </div>
              <h3>
                <b>Video</b>
              </h3>
              <h6 className="text-justify">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius
                asperiores dignissimos ullam vel exercitationem, dolores
                quibusdam fugiat similique minus nihil labore eum.
              </h6>
              <div className="inp w-full">
                <input
                  type="text"
                  className="text-black-900 placeholder-gray-900 w-full rounded-md"
                  placeholder="video describtion ...."
                  style={{ background: "transparent" }}
                />
              </div>
              <div className="mt-4 flex w-full justify-around">
                <button className="w-2/5 rounded-md bg-stone-500 px-4 py-1 shadow-lg shadow-cyan-500/50">
                  Subscribe
                </button>
                <button className="w-2/5 rounded-md bg-stone-500 px-4 py-1 shadow-lg shadow-cyan-500/50">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AcategoryPopModel;
