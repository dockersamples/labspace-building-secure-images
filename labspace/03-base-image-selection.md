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

2. As of writing this lab, Node 24 is the current LTS (Long Term Support) release. Scan through the list to find the two Node 2 options:

    ```plaintext no-copy-button
                  Tag              │                         Details                         │   Pushed    │          Vulnerabilities            
    ───────────────────────────────┼─────────────────────────────────────────────────────────┼─────────────┼─────────────────────────────────────
       24-slim                     │ Benefits:                                               │ 1 week ago  │    0C     3H     3M    22L         
      Major runtime version update │ • Image is smaller by 293 MB                            │             │    -2    -31    -31    -81     -4  
      Also known as:               │ • Image contains 421 fewer packages                     │             │                                    
      • 24.12.0-slim               │ • Major runtime version update                          │             │                                    
      • lts-slim                   │ • Tag was pushed more recently                          │             │                                    
      • krypton-slim               │ • Image introduces no new vulnerability but removes 145 │             │                                    
      • 24-bookworm-slim           │ • Tag is using slim variant                             │             │                                    
      • 24.12-bookworm-slim        │                                                         │             │                                    
      • 24.12.0-bookworm-slim      │ Image details:                                          │             │                                    
      • krypton-bookworm-slim      │ • Size: 79 MB                                           │             │                                    
                                   │ • Runtime: 24.12.0                                      |             |
      ...                          │ ...                                                     │ ...         │ ...
                                   │                                                         │             │                                             
       24                          │ Benefits:                                               │ 1 week ago  │    0C     9H    14M   148L     4?  
      Major runtime version update │ • Major runtime version update                          │             │    -2    -25    -20    +45         
      Also known as:               │ • Tag was pushed more recently                          │             │                                    
      • 24.12.0                    │ • Image has similar size                                │             │                                    
      • 24.12                      │ • Image contains similar number of packages             │             │                                    
      • lts                        │                                                         │             │                                    
      • krypton                    │ Image details:                                          │             │                                    
      • 24-bookworm                │ • Size: 398 MB                                          │             │                                    
      • lts-krypton                │ • Runtime: 24.12.0                                      │             │                                    
      • lts-bookworm               │                                                         │             │                                    
      • 24.12-bookworm             │                                                         │             │                                    
      • krypton-bookworm           │                                                         │             │                                    
      • 24.12.0-bookworm           │                                                         │             │                             
    ```

    You will see that one image is significantly smaller than the other (79MB vs 399MB) and includes far fewer packages (about 418 fewer).

    With this difference, the `-slim` variant also has far fewer vulnerabilities.

3. In the `Dockerfile`, update the base image to use the `node:24-slim` image:

    ```dockerfile
    FROM node:24-slim
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
    node-app     v2        029dbef31e69   2 minutes ago       356MB
    node-app     v1        2fcf7b363939   About an hour ago   1.57GB
    ```

    Look at that! **1.57GB shrunk down to 356MB. That's a ~77% smaller image!** 🎉

6. Run another analysis on the image to determine if the problems have been fixed:

    ```bash
    docker scout quickview node-app:v2
    ```

    This time, when the analysis is performed, you should see it perform faster for two reasons:

    1. **The image is smaller.** Smaller images will be analyzed faster.
    2. **`SBOM obtained from attestation.`** Scout leverages the SBOM attached to an image, if it exists. Otherwise, it will index the image itself. Since you built the image with the SBOM flag, that indexing has already been completed!

    The output should now show a much better position:

    ```plaintext no-copy-button
     Target             │  node-app:v2      │    0C    10H     4M    26L  
       digest           │  da98126f9ef5     │                             
     Base image         │  node:24-slim     │    0C     3H     3M    22L  
     Updated base image │  node:24.12-slim  │    0C     3H     3M    22L  
    ```

    This indicates that there are still a few _high_ vulnerabilities. Seeing the app has a higher count, this indicates the application itself has introduced some vulnerabilities.
