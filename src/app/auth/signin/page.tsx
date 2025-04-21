import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import Login from "@/components/auth/Login";
export const metadata: Metadata = {
  title: "Movies file manager",
  description: "This addmin dashborad use for handle video file uploader",
};

const SignIn: React.FC = () => {
  return <Login />;
};

export default SignIn;
