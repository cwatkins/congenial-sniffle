import { useEffect } from "react";
import { useRouter } from "next/router";
import { useStytchUser, useStytch } from "@stytch/nextjs";
import Manage from "src/components/Manage";
import loadStytch from "lib/loadStytch";
import { useSessionStorage } from "usehooks-ts";

export default function ManagePage() {
  const stytch = useStytch();
  const { user, isInitialized } = useStytchUser();
  const router = useRouter();
  const [otpExpiration, setOtpExpiration] = useSessionStorage(
    "otp-expiration",
    undefined
  );

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/");
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    const sendOtp = async () => {
      try {
        const result = await stytch.otps.email.loginOrCreate(
          user.emails[0].email,
          {
            expiration_minutes: 5,
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    if (isInitialized && user) {
      const now = new Date();
      const codeExpired = now.getTime() <= new Date(otpExpiration).getTime();
      if (codeExpired) {
        return;
      }
      sendOtp();
      const expirationDate = new Date(now.getTime() + 4.5 * 60000);
      setOtpExpiration(expirationDate);
    }
  }, [user, isInitialized, router]);

  return <Manage />;
}

export async function getServerSideProps({ req }) {
  const redirectRes = {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
  const sessionJWT = req.cookies["stytch_session_jwt"];

  if (!sessionJWT) {
    return redirectRes;
  }

  // loadStytch() is a helper function for initalizing the Stytch Backend SDK. See the function definition for more details.
  const stytch = loadStytch();

  try {
    // Authenticate the session JWT. If an error is thrown the session authentication has failed.
    await stytch.sessions.authenticateJwt(sessionJWT);
    return { props: {} };
  } catch (e) {
    return redirectRes;
  }
}
