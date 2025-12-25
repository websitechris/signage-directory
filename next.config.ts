import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/shop-sign-suppliers-brighton',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/vehicle-signage-suppliers-brighton',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/vehicle-signage-sussex',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/vehicle-wraps-suppliers-sussex',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/public-private-signs-worthing',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/luminated-led-signs-brighton',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/boat-names-stripes-brighton',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/personal-clothing-printing-sussex',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/large-format-printing-sussex',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/self-adhesive-letter-printing-sussex',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/contact-a-to-z-of-signs',
        destination: '/sussex-signs',
        permanent: true,
      },
      {
        source: '/signage-design-and-supply-brighton',
        destination: '/sussex-signs',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
