<script setup lang="ts">
import Arrow from './Arrow.vue';

const attackPath = ref('');
const counterAttackPath = ref('');

// const buildArrowBetweenTwoCards = (
//   card1: string,
//   card2: string,
//   biasY: number
// ) => {
//   const boardRect =
//     ui.value.DOMSelectors.board.element!.getBoundingClientRect();
//   const startRect = document
//     .querySelector(ui.value.DOMSelectors.cardOnBoard(card1).selector)
//     ?.getBoundingClientRect();
//   const endRect = document
//     .querySelector(ui.value.DOMSelectors.cardOnBoard(card2).selector)
//     ?.getBoundingClientRect();

//   if (!startRect || !endRect) return '';

//   const start = {
//     x: Math.round(startRect.left + startRect.width / 2 - boardRect.left),
//     y: Math.round(startRect.top + startRect.height / 2 - boardRect.top)
//   };
//   const end = {
//     x: Math.round(endRect.left + endRect.width / 2 - boardRect.left),
//     y: Math.round(endRect.top + endRect.height / 2 - boardRect.top)
//   };

//   const highest = Math.min(start.y, end.y);
//   const halfX = (start.x + end.x) / 2;
//   let yDiff = Math.abs(start.y - end.y);
//   if (yDiff === 0) {
//     yDiff = biasY;
//   }
//   return `
//         M${start.x},${start.y}
//         Q${halfX},${highest - yDiff / 2}
//          ${end.x},${end.y}
//       `;
// };
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow :path="attackPath" color="red" v-if="attackPath" />
    <Arrow :path="counterAttackPath" color="lime" v-if="counterAttackPath" />
  </Teleport>
</template>
