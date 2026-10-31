#!/bin/bash
# 给作品托盘补 Dayline 物件：两张在原图上编辑，两张按原提示词重生
cd /Users/haoo/Documents/Haoo-blog/.claude/worktrees/funny-feynman-e5b04b/output/dayline-tray-2026-10-31
G=/Users/haoo/.agents/skills/imagegen/scripts/imagegen_relay
BW="Black-and-white photograph, fine film grain, soft natural light, wide tonal range, calm and quiet mood, generous empty light-gray space. No text, no letters, no numbers, no logos, no readable writing anywhere."
OBJ="a small closed hardcover pocket journal notebook with a soft linen cover, with the corners of two or three square instant-film photo prints tucked between its pages and sticking out of the top edge, the visible photos showing soft blurry everyday scenes"

PE="Keep this photograph exactly as it is: same camera angle, same cutting mat, same wooden tray, same lighting, grain, tools and empty space. Change only what is inside the tray's top row of compartments. Top-left compartment: $OBJ. Top-middle compartment: the small stack of folded printed paper held with a metal paperclip that is currently in the top-left compartment. Top-right compartment: the neatly coiled short USB cable that is currently in the top-middle compartment. The bottom three compartments stay empty. Each object sits fully inside its own compartment. $BW"

PG="Perfectly top-down view of a gray self-healing cutting mat on a workbench, soft window light from the upper left. On the mat, slightly left of center, a shallow wooden parts organizer tray with six square compartments in a 3 by 2 grid, edges parallel to the frame. Top-left compartment: $OBJ. Top-middle compartment: a small stack of folded printed paper held with a metal paperclip. Top-right compartment: a neatly coiled short USB cable. The bottom three compartments are empty, showing only soft shadows of their walls. A small screwdriver and a pair of tweezers lie on the mat to the right. Lots of empty mat space on the right third. $BW"

SRC=../../public/images/refresh/bench.jpg
for n in 1 2; do
  $G edit --image $SRC --size 1536x1024 --quality high --out edit-$n.png --prompt "$PE" > edit-$n.log 2>&1 &
  $G generate --size 1536x1024 --quality high --out gen-$n.png --prompt "$PG" > gen-$n.log 2>&1 &
done
wait
ls -la *.png
tail -n 3 *.log
