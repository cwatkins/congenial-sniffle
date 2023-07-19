import { useRouter } from "next/router";

const Manage = () => {
  const router = useRouter();

  return (
    <div className="card">
      <div
        style={{
          width: "80%",
        }}
      >
        <p
          style={{
            textAlign: "center",
          }}
        >
          This is an account management page
        </p>
        <button
          style={{
            margin: "4px",
            width: "100%",
            padding: "8px 6px",
          }}
          onClick={() => router.replace("/manage")}
        >
          Manage your account
        </button>
      </div>
    </div>
  );
};

export default Manage;
