# 📦 Base image selection

Choosing a good base image is critically important when it comes to your overall container security.

Some things to think about include:

- **Who is providing the base image?** Will it be supported and maintained?
- **What OS distribution is being used?** Can you configure the environment with the packages and dependencies your application requires?
- **What packages and tools are provided?** Are the required tools available? Are there extras that aren't needed?

Ideally, you want to keep the idea of "least privilege" - include only what's needed to run your application and nothing more. This reduces both maintenance and potential attack surfaces.

> [!TIP]
> If your organization is looking for minimal images with near-zero CVEs and enterprise-grade SLAs, check out [Docker Hardened Images](https://www.docker.com/products/hardened-images/).



## 🗺️ Choosing a base image

The project's :fileLink[`Dockerfile`]{path="Dockerfile" line=1} has the following base image:

```dockerfile
FROM node:18
```

Based on the previous analysis, there were several issues. And, Node 18 is no longer supported. Time to update!

1. Use the `docker scout recommendations` command to get recommendations for a newer base image:

    ```bash
    docker scout recommendations node-app:v1
    ```

    In the output, you will see quite a few options provided to you.

2. As of writing this lab, Node 22 is the current LTS (Long Term Support) release. Scan through the list to find the two Node 22 options:

    ```plaintext no-copy-button
                  Tag              │                         Details                         │   Pushed    │          Vulnerabilities            
    ───────────────────────────────┼─────────────────────────────────────────────────────────┼─────────────┼─────────────────────────────────────
       22-slim                     │ Benefits:                                               │ 1 day ago   │    0C     0H     1M    24L          
      Major runtime version update │ • Image is smaller by 292 MB                            │             │    -2    -20    -21    -85     -4   
      Also known as:               │ • Image contains 418 fewer packages                     │             │                                     
      • 22.20.0-slim               │ • Major runtime version update                          │             │                                     
      • 22.20-slim                 │ • Tag was pushed more recently                          │             │                                     
      • lts-slim                   │ • Image introduces no new vulnerability but removes 128 │             │                                     
      • jod-slim                   │ • Tag is using slim variant                             │             │                                     
      • 22-bookworm-slim           │                                                         │             │                                     
      • lts-bookworm-slim          │ Image details:                                          │             │                                     
      • jod-bookworm-slim          │ • Size: 79 MB                                           │             │                                     
      • 22.20-bookworm-slim        │ • Runtime: 22.20.0                                      │             │                                     
      • 22.20.0-bookworm-slim      │                                                         │             │                                     
                                   │                                                         │             │                                         
      ...                          │ ...                                                     │ ...         │ ...
                                   │                                                         │             │                                             
       22                          │ Benefits:                                               │ 1 day ago   │    0C     6H     3M   143L     4?   
      Major runtime version update │ • Major runtime version update                          │             │    -2    -14    -19    +34          
      Also known as:               │ • Tag was pushed more recently                          │             │                                     
      • 22.20.0                    │ • Image has similar size                                │             │                                     
      • 22.20                      │ • Image contains similar number of packages             │             │                                     
      • lts                        │                                                         │             │                                     
      • jod                        │ Image details:                                          │             │                                     
      • lts-jod                    │ • Size: 399 MB                                          │             │                                     
      • 22-bookworm                │ • Runtime: 22.20.0                                      │             │                                     
      • jod-bookworm               │                                                         │             │                                     
      • lts-bookworm               │                                                         │             │                                     
      • 22.20-bookworm             │                                                         │             │                                     
      • 22.20.0-bookworm           │    
    ```

    You will see that one image is significantly smaller than the other (79MB vs 399MB) and includes far fewer packages (about 418 fewer).

    With this difference, the `-slim` variant also has far fewer vulnerabilities.

3. In the `Dockerfile`, update the base image to use the `node:22-slim` image:

    ```dockerfile
    FROM node:22-slim
    ```

4. Build the image again using the new base image. This time though, you're going to add two additional flags:

    ```bash
    docker build -t node-app:v2 --sbom=true --provenance=mode=max .
    ```

    - **`--sbom=true`** - automatically produce and attach a SBOM (Software Bill of Materials) to the image
    - **`--provenance=mode=max`** - automatically product and attach build provenance to the image. This includes details about how the image was built, its base image, and more. This is very valuable in multi-stage builds, as it captures details about all intermediate stages.

5. Before performing an analysis, take a look at the image size of the original image with this newer slim-variant-based image with the following `docker image ls` command:

    ```bash
    docker image ls --filter=reference=node-app
    ```

    You should see output similar to the following, showing the image size reduction:

    ```plaintext no-copy-button
    REPOSITORY   TAG       IMAGE ID       CREATED             SIZE
    node-app     v2        029dbef31e69   2 minutes ago       363MB
    node-app     v1        2fcf7b363939   About an hour ago   1.57GB
    ```

    Look at that! **1.57GB shrunk down to 363MB. That's a ~77% smaller image!** 🎉

6. Run another analysis on the image to determine if the problems have been fixed:

    ```bash
    docker scout quickview node-app:v2
    ```

    This time, when the analysis is performed, you should see it perform faster for two reasons:

    1. **The image is smaller.** Smaller images will be analyzed faster.
    2. **`SBOM obtained from attestation.`** Scout leverages the SBOM attached to an image, if it exists. Otherwise, it will index the image itself. Since you built the image with the SBOM flag, that indexing has already been completed!

    The output should now show a much better position:

    ```plaintext no-copy-button
    Target             │  node-app:v2   │    0C     5H     2M    28L   
      digest           │  21616770631b  │                              
    Base image         │  node:22-slim  │    0C     0H     1M    24L   
    Updated base image │  node:24-slim  │    0C     0H     1M    24L   
    ```

    This indicates that there are still a few _high_ vulnerabilities. But, they are no longer coming from our base image. These must have been introduced by the application you packaged into the container image.
