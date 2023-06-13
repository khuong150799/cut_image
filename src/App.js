import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import axios from "axios";
import Swal from "sweetalert2";

function App() {
  const [showCrop, setShowCrop] = useState(false);
  const [imageURL, setImageURL] = useState(
    "https://cdn-icons-png.flaticon.com/512/1053/1053244.png"
  );
  const [data, setData] = useState([]);
  const [img, setImg] = useState();
  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(
        "http://192.168.102.13:3010/api/user/getinfo"
      );
      setData(result.data);
      console.log(result);
    };
    getData();
  }, []);

  // console.log(data.data[0].id);
  const cropperRef = useRef(null);
  const onCrop = () => {
    const cropper = cropperRef?.current?.cropper;
    // console.log(cropper.getCroppedCanvas().toDataURL());
  };
  function Base64ToFile(base64String, filename) {
    const arr = base64String?.split(",");
    const mime = arr[0]?.match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr?.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr?.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  const axiosUpload = axios.create({
    baseURL: "http://192.168.102.13:3010/api",
  });
  const handleCrop = async () => {
    cropperRef.current.cropper.enable();
    const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
    const croppedImage = croppedCanvas.toDataURL();
    // console.log(croppedImage);
    setImageURL(croppedImage);
    setShowCrop(false);
    // console.log(Base64ToFile(croppedImage, "file"));
    // Do something with the cropped image
    const formData = new FormData();
    formData.append("image", Base64ToFile(croppedImage, "file"));
    // console.log(formData.append("image", Base64ToFile(croppedImage, "file")));
    try {
      const url = `http://192.168.102.13:3010/api/customer/upload-image/1`;
      const response = await axiosUpload({
        method: "PUT",
        url,
        data: formData,
      });
      console.log(response);
      setImg(response?.data?.data?.newData?.image);
      if (response?.data?.result) {


        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          width: 500,
        });
  
        Toast.fire({
          icon: "success",
          title: response?.data?.data?.msg,
        });
      } else {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          width: 500,
        });
  
        Toast.fire({
          icon: "error",
          title: response?.data?.data?.msg,
        });
      }

    } catch (error) {
      console.log(error);
    }
    
  };
  // console.log(img);
  return (
    <div className="App">
      {/* <h1>{data?.data[0]?.name}</h1> */}

      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: " center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {img && (
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "500px",
              position: "absolute",
              right: "30px",
              top: "10px",
              boxShadow: "0 0 10px black",
              border: "8px solid black",
              overflow: "hidden",
            }}
          >
            <img
              src={`http://192.168.102.13:3010/customer/thumb/${img}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
        {showCrop ? (
          <>
            <Cropper
              src={imageURL}
              style={{
                height: "auto",
                maxHeight: "50vh",
                width: "60vh",
                border: "2px solid blue",
                margin: "0 auto",
              }}
              // Cropper.js options
              initialAspectRatio={1 / 1}
              guides={false}
              crop={onCrop}
              ref={cropperRef}
            />
            <button
              className="btn btn-info"
              style={{ marginTop: "30px" }}
              onClick={handleCrop}
            >
              cắt
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                width: "200px",
                height: "200px",
                margin: "0 auto",
                position: "relative",
              }}
            >
              <img
                src={imageURL}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "100%",
                }}
              />
              <label
                style={{
                  position: "absolute",
                  fontSize: "2em",
                }}
              >
                <i className="fa-solid fa-camera"></i>
                <input
                  style={{ display: "none" }}
                  type="file"
                  onChange={(e) => {
                    // setImageURL(e.target.files[0])
                    // console.log(e.target.files[0]);
                    setShowCrop(true);
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onloadend = function () {
                      setImageURL(reader.result);
                    };
                  }}
                />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
