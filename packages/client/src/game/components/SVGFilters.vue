<script setup lang="ts"></script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
    <defs>
      <filter
        id="dissolve-filter"
        x="-200%"
        y="-200%"
        width="500%"
        height="500%"
        color-interpolation-filters="sRGB"
        overflow="visible"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.004"
          numOctaves="1"
          result="bigNoise"
        />

        <feComponentTransfer in="bigNoise" result="bigNoiseAdjusted">
          <feFuncR type="linear" slope="3" intercept="-1" />
          <feFuncG type="linear" slope="3" intercept="-1" />
        </feComponentTransfer>

        <feTurbulence
          id="dissolve-filter-turbulence"
          type="fractalNoise"
          baseFrequency="1"
          numOctaves="1"
          result="fineNoise"
        />

        <feMerge result="mergedNoise">
          <feMergeNode in="bigNoiseAdjusted" />
          <feMergeNode in="fineNoise" />
        </feMerge>

        <feDisplacementMap
          id="dissolve-filter-displacement"
          in="SourceGraphic"
          in2="mergedNoise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>

    <defs>
      <filter id="bloom-filter">
        <feComponentTransfer result="bloom-amplified">
          <feFuncR id="bloom-funcR" type="linear" slope="4.5" intercept="0" />
          <feFuncG id="bloom-funcG" type="linear" slope="4.5" intercept="0" />
          <feFuncB id="bloom-funcB" type="linear" slope="4.5" intercept="0" />
        </feComponentTransfer>
        <feColorMatrix
          in="bloom-amplified"
          type="saturate"
          values="0"
          result="bloom-desaturated"
        />
        <feComponentTransfer in="bloom-desaturated" result="bloom-thresholded">
          <feFuncR type="discrete" tableValues="0,1" />
          <feFuncG type="discrete" tableValues="0,1" />
          <feFuncB type="discrete" tableValues="0,1" />
        </feComponentTransfer>
        <feColorMatrix
          in="bloom-thresholded"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  1 0 0 0 0"
          result="alphaMask"
        />
        <feComposite
          in="SourceGraphic"
          in2="alphaMask"
          operator="arithmetic"
          k1="1"
          k2="0"
          k3="0"
          k4="0"
          result="maskedSource"
        />
        <feComponentTransfer in="maskedSource" result="brightened">
          <feFuncR id="brightR" type="linear" slope="2.5" />
          <feFuncG id="brightG" type="linear" slope="2.5" />
          <feFuncB id="brightB" type="linear" slope="2.5" />
        </feComponentTransfer>
        <feGaussianBlur
          id="blur"
          in="brightened"
          stdDeviation="5"
          edgeMode="none"
          result="blurredBloom"
        />
        <feComposite in="SourceGraphic" in2="blurredBloom" operator="lighter" />
      </filter>
    </defs>
  </svg>
</template>
