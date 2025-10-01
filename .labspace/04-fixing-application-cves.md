# 🪲 Fixing application CVEs

Now that you have a solid base image, it is time to focus on the application-layer issues.

> [!NOTE]
> Remember that while this lab is focusing on a Node-based application, the same principles apply for all other programming languages. Therefore, don't focus too much on the specific files being updated, but the overall principles.



## Identifying and fixing issues

As you saw in the previous section, updating base images can resolve a significant number of issues. However, your own applications and its dependencies can also introduce issues.

1. Use the `docker scout cves` command to list all discovered vulnerabilities:

    ```bash
    docker scout cves node-app:v2
    ```

    After a moment, you will see details about each of the vulnerabilities discovered in the image.

2. Looking at the output, you will see output similar to the following:

    ```plaintext no-copy-button
      0C     1H     1M     1L  express 4.17.1
    pkg:npm/express@4.17.1

    Dockerfile (7:7)
    COPY . .

        ✗ HIGH CVE-2022-24999 [OWASP Top Ten 2017 Category A9 - Using Components with Known Vulnerabilities]
        https://scout.docker.com/v/CVE-2022-24999
        Affected range : <4.17.3                                       
        Fixed version  : 4.17.3                                        
        CVSS Score     : 7.5                                           
        CVSS Vector    : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H  
        
        ✗ MEDIUM CVE-2024-29041 [Improper Validation of Syntactic Correctness of Input]
        https://scout.docker.com/v/CVE-2024-29041
        Affected range : <4.19.2                                       
        Fixed version  : 4.19.2                                        
        CVSS Score     : 6.1                                           
        CVSS Vector    : CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N  
        
        ✗ LOW CVE-2024-43796 [Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')]
        https://scout.docker.com/v/CVE-2024-43796
        Affected range : <4.20.0                                                          
        Fixed version  : 4.20.0                                                           
        CVSS Score     : 2.3                                                              
        CVSS Vector    : CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:P/VC:N/VI:N/VA:N/SC:L/SI:L/SA:L  
    ```

    A couple of things to note out of this:

    - `pkg:npm/express@4.17.1` - this part of the report is related to the NPM package named `express`, which has version 4.17.1
    - `Dockerfile (7:7)` - the output provides the specific instruction in the Dockerfile that introduced the vulnerability. This is because of the provenance attestation generated during the build
    - CVE details - details about each of the vulnerabilities, including links to get more details

3. You will also see a few vulnerabilities still coming from the base image. To filter those out, add the `--ignore-base` flag:

    ```bash
    docker scout cves node-app:v2 --ignore-base
    ```

4. Looking back at the output for the express library, you should see that the greatest fix version is `4.20.0`. 

    The `path-to-regexp` library is updated to a fixed version in express version `4.21.2`. Update to this version by running the following command:

    ```bash
    npm install express@4.21.2
    ```

5. Build your image again by running the following command:

    ```bash
    docker build -t node-app:v3 --sbom=true --provenance=mode=max .
    ```

6. And run one more analysis on the image:

    ```bash
    docker scout quickview node-app:v3
    ```

    You should see output similar to the following now:

    ```plaintext
      Target             │  node-app:v3   │    0C     0H     1M    24L   
        digest           │  95f3c9d9a4a2  │                              
      Base image         │  node:22-slim  │    0C     0H     1M    24L   
      Updated base image │  node:24-slim  │    0C     0H     1M    24L  
    ```

    Hooray! No more CVEs rated critical or high!