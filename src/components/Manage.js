import React from "react";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { useRouter } from "next/router";
import { useSessionStorage } from "usehooks-ts";

const Manage = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const router = useRouter();

  const [input, setInput] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [otpExpiration, setOtpExpiration] = useSessionStorage(
    "otp-expiration",
    undefined
  );

  function handleClick() {
    fetch("/api/verify", {
      method: "POST",
      body: JSON.stringify({ code: input }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then(({ error, url }) => {
        if (error) {
          console.log(error);
          setMessage(JSON.stringify(error, null, 2));
        }
        if (url) {
          setOtpExpiration(new Date());
          router.replace(url);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("An error occurred. Please try again later.");
      });
  }

  return (
    <div className="card">
      <div
        style={{
          width: "80%",
        }}
      >
        <p>
          We&apos;ve sent a passcode to your email address. Please verify below:
        </p>
        <div>
          <input
            style={{
              width: "100%",
              padding: "8px 6px",
              margin: "4px",
            }}
            type="number"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button
          style={{
            margin: "4px",
            width: "100%",
            padding: "8px 6px",
          }}
          onClick={handleClick}
        >
          Submit
        </button>
        {message && <p>Error: {message}</p>}
      </div>
    </div>
  );
};

export default Manage;
