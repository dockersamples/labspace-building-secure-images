# Labspace - Building secure images

Once you've learned to build images, the next question is "Did you build a good image?" Is it secure? Is it following best practices?

In this Labspace, you'll learn how to ensure your images are secure and following best practices. You'll learn how to leverage Docker Scout to analyze and fix discovered issues.



## Learning objectives

By the end of this Labspace, you will have learned the following:

- Use Docker Scout to perform an analysis of a container image
- Select base images for a more secure foundation
- Resolve application-level CVEs
- Configure a default non-root user

## Launch the Labspace

To launch the Labspace, run the following command:

```bash
docker compose -f oci://dockersamples/labspace-building-secure-images up -d
```

And then open your browser to http://localhost:3030.

### Using the Docker Desktop extension

If you have the Labspace extension installed (`docker extension install dockersamples/labspace-extension` if not), you can also [click this link](https://open.docker.com/dashboard/extension-tab?extensionId=dockersamples/labspace-extension&location=dockersamples/labspace-building-secure-images&title=Building%20secure%20images) to launch the Labspace.
