# Motion AI Studio — Full Character Motion (Artifact-Free Mesh Engine)

## What Was Fixed & Verified
1. **Zero Slice Tears or Seams (`16x16` Continuous Bilinear Triangle Mesh):** Replaced horizontal strip slicing (which could cause visible horizontal step lines or edge gaps) with a continuous 16×16 triangulated mesh with sub-pixel seam padding and pinned outer borders (`borderPin = 0` at edges).
2. **Automatic Subject Detection (`detectSubjectCenter`):** Automatically locates the person(s) in the frame and applies smooth Gaussian-weighted articulation to the head, torso/chest, and lower body (breathing, walking gait, head turn/nod, or action lunge) without distorting the background frame.
3. **Full-Frame Display:** Keeps 100% of the uploaded image and exported video visible on mobile and desktop.
