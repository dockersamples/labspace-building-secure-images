# Performing an image analysis

In this section, you're going to build an image and perform an analysis on the image.



## Building and analyzing the image

This lab already has a `Dockerfile`, so you can easily build the image.

1. Use the `docker build` command to build the image:

    ```bash
    docker build -t node-app:v1 .
    ```

2. In order to use Docker Scout to analyze the image, you will need to be logged in. Run the `docker login` command and complete the steps to authenticate:

    ```bash
    docker login
    ```

    Follow the instructions to complete login. When you're done, you should see the following message:

    ```bash no-run-button no-copy-button
    Login Succeeded
    ```

3. Now that you have an image and are authenticated, analyze the image with the `docker scout quickview` command:

    ```bash
    docker scout quickview node-app:v1
    ```

    You will see output indicating Scout is indexing the packages in the image. Eventually, you will see output similar to the following:

    ```plaintext no-run-button no-copy-button
        ✓ Image stored for indexing
        ✓ Indexed 790 packages
        ✓ Provenance obtained from attestation

        i Base image was auto-detected. To get more accurate results, build images with max-mode provenance attestations.
        Review docs.docker.com ↗ for more information.

    Target             │  node-app:v1   │    2C    25H    23M   113L     4?   
      digest           │  2fcf7b363939  │                                     
    Base image         │  node:18       │    2C    20H    22M   109L     4?   
    Updated base image │  node:24-slim  │    0C     0H     1M    24L          
                       │                │    -2    -20    -21    -85     -4   
    ```

    This output tells you that there are a few issues with this image. 

    > [!IMPORTANT]
    > **The breakdown helps you understand what issues were inherited by the base image versus what you introduced in the application itself**.
    
    You will learn how to fix these over the few sections.

4. If your account is part of an paid organization, you may have additional output that reflects policy alignment. 

    An example is below:

    ```plaintext no-copy-button
    Policy status  FAILED  (1/7 policies met, 2 missing data)

      Status │                     Policy                     │           Results            
    ─────────┼────────────────────────────────────────────────┼──────────────────────────────
      !      │ No default non-root user found                 │                              
      !      │ AGPL v3 licenses found                         │    4 packages                
      !      │ Fixable critical or high vulnerabilities found │    2C    24H     0M     0L   
      ✓      │ No high-profile vulnerabilities                │    0C     0H     0M     0L   
      ?      │ No outdated base images                        │    No data                         
      ?      │ No unapproved base images                      │    No data                   
      !      │ Missing supply chain attestation(s)            │    2 deviations        
    ```

    Although you may not have these same policies, these are a great set of base policies to follow:

    - Use a non-root user
    - No fixable critical or high vulnerabilities
    - And fixing attestation issues

Let's start making our image better by fixing vulnerabilities. You'll start with the base image selection.