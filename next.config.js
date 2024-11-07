/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.alias['@arcgis/core'] = '@arcgis/core';
        return config;
    },
};

module.exports = nextConfig;
