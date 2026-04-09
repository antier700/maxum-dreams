"use client";

import { memo, useState } from "react";
import Image from "next/image";

function iconSrc(symbol: string): string {
  return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

export type CoinIconProps = {
  symbol: string;
  size?: number;
};

function CoinIconInner({ symbol, size = 28 }: CoinIconProps) {
  const [failed, setFailed] = useState(false);

  if (!symbol) return null;

  if (failed) {
    return (
      <span className="coin-icon coin-icon--fallback" style={{ width: size, height: size }} aria-hidden>
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="coin-icon coin-icon--image">
      <Image
        src={iconSrc(symbol)}
        alt=""
        width={size}
        height={size}
        className="coin-icon__img"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export const CoinIcon = memo(CoinIconInner);
