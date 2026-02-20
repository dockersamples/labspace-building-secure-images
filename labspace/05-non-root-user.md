#  Using a non-root user

Following the principle of least privilege, you should run your container using a non-root user whenever possible. 

If a compromise were to happen, a non-root user is going to have much greater permission to install new packages, reducing the affects.

> [!NOTE]
> Each language runtime and application may need different permissions while running to read files, create temporary files, and more. After changing the default user, be sure to test your application to ensure it works as intended.

## Finding and using a non-root user

Some container images already have multiple users configured, although the root user may be the default. Therefore, you should check first to see what users are available.

1. Run the following command to see what users are configured in the `node:lts-slim` image:

    ```bash
    docker run --rm -ti node:lts-slim cut -d: -f1,3 /etc/passwd
    ```

    In the output, you will see all of the usernames and their respective uids:

    ```plaintext no-copy-button
    root:0
    daemon:1
    bin:2
    ...
    _apt:42
    nobody:65534
    node:1000
    ```

    Looking at this list, you will see an entry for `node:1000`.

    > [!TIP]
    > If your image doesn't provide a non-root user, you can use the `adduser` or `useradd` command (depending on the image) to create the user with a `RUN` statement in your Dockerfile.

2. Update the `Dockerfile` to use the `node` user by adding the following line before the `CMD` instruction:

    ```dockerfile
    USER node
    ```

    The end of your file should now look like the following:

    ```dockerfile no-copy-button
    COPY ./src ./src
    EXPOSE 3000
    USER node
    CMD ["node", "src/index.js"]
    ```

3. Rebuild your image with `docker build`:

    ```bash
    docker build -t node-app:v4 --sbom=true --provenance=mode=max .
    ```

4. Perform one final analysis on the image:

    ```bash
    docker scout quickview node-app:v4
    ```

    Great! Everything looks to be happy now.

5. Before considering everything done, start the new container and validate it still works as expected:

    ```bash
    docker run -dp 3000:3000 node-app:v4
    ```

    Once the container has started, open the app at :tabLink[http://localhost:3000]{title="Webapp" href="http://localhost:3000"}. You should see a "Hello world", indicating the app started and is running as expected.

