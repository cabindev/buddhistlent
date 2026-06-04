import React from 'react'
import Image from 'next/image'
type Props = {}

export default function HeroSection({}: Props) {
  return (
    <div>
        <Image
        id="x-right"
        src="/heroSection.jpg"
        alt="Right Logo"
        width={150}
        height={150}
        className="absolute"
      />
    </div>
  )
}