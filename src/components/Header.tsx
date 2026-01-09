"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import React, { CSSProperties, FC } from "react";

const Header: FC = () => {
  return (
    <header style={headerStyle}>
      {/* Left side: Title */}
      <h1 style={titleStyle}>Token Sender: Wallet Interaction Demo Page</h1>

      {/* Center: GitHub and LinkedIn buttons */}
      <div style={linksContainerStyle}>
        {/* GitHub */}
        <a
          href="https://github.com/ssanin82/web-tsender-recreate"
          target="_blank"
          rel="noopener noreferrer"
          style={iconLinkStyle}
          aria-label="GitHub"
        >
          <FaGithub size={24} color="#fff" />
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/saninsergiy/"
          target="_blank"
          rel="noopener noreferrer"
          style={iconLinkStyle}
          aria-label="LinkedIn"
        >
          {/* Inline SVG with blue background + white "in" */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 34 34"
            style={{ borderRadius: 4 }}
          >
            <rect width="34" height="34" rx="4" fill="#0077B5" />
            <path
              d="M8 13h4v12H8V13zm2-6a2 2 0 110 4 2 2 0 010-4zm6 6h3v2h.04c.42-.8 1.45-1.64 2.96-1.64 3.17 0 3.76 2.09 3.76 4.8V25h-4v-5.33c0-1.27-.02-2.91-1.77-2.91-1.77 0-2.04 1.38-2.04 2.81V25h-4V13z"
              fill="#fff"
            />
          </svg>
        </a>
      </div>

      {/* Right side: ConnectButton */}
      <div>
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;

/* --- Inline styles for dark mode --- */
const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.5rem 1rem",
  borderBottom: "1px solid #444",
  backgroundColor: "#121212", // dark background
};

const titleStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  margin: 0,
  color: "#fff", // white text
};

const linksContainerStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  alignItems: "center",
};

const iconLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  color: "inherit",
};
