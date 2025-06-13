<script setup lang="ts"></script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
    <defs>
      <!--
      Define 'dissolve-filter' to create the dissolve effect.
      Enlarged filter area to prevent clipping.
    -->
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

        <!-- Enhance noise contrast -->
        <feComponentTransfer in="bigNoise" result="bigNoiseAdjusted">
          <feFuncR type="linear" slope="3" intercept="-1" />
          <feFuncG type="linear" slope="3" intercept="-1" />
        </feComponentTransfer>

        <!-- Generate fine-grained fractal noise -->
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1"
          numOctaves="1"
          result="fineNoise"
        />

        <!-- Merge the adjusted big noise and fine noise -->
        <feMerge result="mergedNoise">
          <feMergeNode in="bigNoiseAdjusted" />
          <feMergeNode in="fineNoise" />
        </feMerge>

        <!-- Apply displacement map to distort the image -->
        <feDisplacementMap
          in="SourceGraphic"
          in2="mergedNoise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
</template>
