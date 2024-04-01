Overview and existing Algorithms

Image registration is a crucial process in medical imaging that aligns two or more images of the same scene taken at different times, from different viewpoints, or using different imaging modalities. Here's a brief overview of some common image registration algorithms used in medical imaging along with their pros and cons:

1. Intensity-based Registration:

Useful when images have similar intensity characteristics, such as when aligning images from the same modality and similar imaging conditions.

Pros: Simple and intuitive, often used when images have similar intensity characteristics. (distribution and properties of pixel brightness or darkness within an image, such as intensity distribution, contrast, dynamic range, noise level)

Cons: Susceptible to noise and variations in intensity due to changes in imaging conditions.

2. Feature-based Registration (The Chosen one)

Effective when aligning images with distinct and identifiable features, such as aligning CT or MRI images with anatomical landmarks. However, the computational cost may increase with the number of features and the complexity of the matching process.

Pros: Matches distinctive features such as edges or corners, robust to variations in intensity.

Cons: Can be computationally expensive, may fail if the features are not well-defined or not present in both images.

3. Mutual Information-based Registration

Pros: Measures statistical dependence between images, effective for aligning images with different intensity distributions.

Cons: Sensitive to noise and may require optimization techniques for accurate alignment.

4. Optical Flow Registration:

Pros: Estimates motion vectors by tracking pixel intensities between frames, useful for dynamic imaging.

Cons: Prone to errors in the presence of occlusions and large displacements.

5. Deformable Registration: (Interesting)

Essential for aligning images with complex anatomical structures, such as aligning MRI images of the brain with lesions or tumors.

- Pros: Allows for non-linear transformations, useful for aligning images with complex anatomical structures.

- Cons: More computationally demanding, requires regularization to prevent overfitting.

6. Demons Registration:

   - Pros: Based on fluid flow model, capable of capturing large deformations.

   - Cons: Sensitive to initialization and may produce inaccuracies in regions with low image contrast.

7. B-Spline Registration:

   - Pros: Represents transformations using B-spline basis functions, provides smooth and flexible deformations.

   - Cons: Computationally intensive, requires careful tuning of control points.

8. Atlas-based Registration:

   - Pros: Utilizes a reference image (atlas) to guide the registration process, useful for population-based studies.

   - Cons: Dependent on the quality and representativeness of the atlas, may not generalize well to new datasets.

QUESTIONS:

Should the engine choose the registration algorithm based on loaded study? Or we'll choose an algorithm and use it for all kind of medical images? (I think it should be smart)

Feature-based Registration

In feature-based image registration algorithms, several inputs are essential for successful alignment of images. These inputs help identify and match distinctive features between the images. The key inputs include:

Feature Detection Method (Haris Corner Detection, SIFT, SURF, Fast Feature Detection Algo, ...)

Feature Descriptor

Feature Matching Criterion

Transformation Model

Optimization Method

Stopping Criteria

What is Homography?

Two images of a scene are related by a homography under two conditions.

The two images are that of a plane (e.g. sheet of paper, credit card etc.).

The two images were acquired by rotating the camera about its optical axis. We take such images while generating panoramas.
