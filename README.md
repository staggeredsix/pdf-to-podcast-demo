<h2><img align="center" src="https://github.com/user-attachments/assets/cbe0d62f-c856-4e0b-b3ee-6184b7c4d96f">NVIDIA AI Blueprint: PDF to Podcast</h2>

## Overview
A microservice driven implementation for transforming PDFs into engaging audio content.

For a deeper dive into the system architecture, please see the diagram below:

View a mermaid diagram of our system [here](docs/README.md).

## Quick Start Guide

1. **Environment Variables**:
   Set the following environment variables:
   ```bash
   # Create .env file with required variables
   echo "ELEVENLABS_API_KEY=your_key" > .env
   echo "NIM_KEY=your_key" >> .env
   echo "MAX_CONCURRENT_REQUESTS=1" >> .env
   ```

   > **Note:** the NVIDIA Eleven Labs API key used in this example can handle concurrent requests. For local development, set `MAX_CONCURRENT_REQUESTS=1` to avoid rate-limiting issues. Generate your own API key for free [here](https://elevenlabs.io/).

2. **Install Dependencies**:
   We use [UV](https://pypi.org/project/uv/) to manage Python dependencies.
   
   ```bash
   make uv
   ```
   This will:
   - Install UV if not present
   - Create virtual environment
   - Install project dependencies

   If you open up a new terminal window and want to quickly re-use the same environment, you can run `make uv` again.

3. **Start Development Server**:
   Start the entire stack with:

   ```bash
   make all-services
   ```

   This command will:
   - Verify environment variables are set
   - Create necessary directories
   - Start all services using Docker Compose in `--build` mode. 

   > **Note:** The first time you run `make all-services`, the `docling` service may take 10-15 minutes to pull and build. Subsequent runs will be much faster.

   You can also set `DETACH=1` to run the services in detached mode, which allows you to continue using your terminal while the services are running.

5. **Run Podcast Generation**:

   ```bash
   source .venv/bin/activate
   python tests/test.py --target <pdf1.pdf> --context <pdf2.pdf>
   ```

   This will generate a 2-person podcast. Add the `--monologue` flag to generate a 1-person podcast. Check out the test file for more examples.

## Customization

### Host the PDF service on a separate machine

This blueprint uses [docling](https://github.com/DS4SD/docling) as the default PDF extraction service.

To run the PDF extraction service on a separate machine, add the following to your `.env` file: 
```bash
echo "MODEL_API_URL=<pdf-model-service-url" >> .env
```
The `make model-dev` target will let you spin up only the docling service.  

### Use a Self-hosted NIM 

We currently use an ensemble of 3 LLMS to generate these podcasts. Out of the box, we recommend using the LLama 3.1-70B NIM. If you would like to use a different model, you can update the `models.json` file with the desired model. The default `models.json` calls an NVIDIA-hosted NIM. Feel free to use it as you develop locally. When you deploy, please use our NIM API Catalog endpoints.

### Change the Default Models and GPU Assignments

Due to our design, it is relatively easy to swap out different pieces of our stack to optimize for GPU usage and available hardware. For example, you could swap each model with the smaller LLama 3.1-8B NIM and disable GPU usage for `docling` in `docker-compose.yaml`.

### Enable Tracing
We expose a Jaeger instance at `http://localhost:16686/` for tracing. This is useful for debugging and monitoring the system.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python tests/test.py <pdf1> <pdf2>`
5. Run linting: `make ruff`
6. Submit a pull request

### Code Quality
The project uses `ruff` for linting and formatting. You must run `make ruff` before your PR can be merged:

```bash
make ruff  # Runs both lint and format
```
### CI/CD
We use GitHub Actions for CI/CD. We run the following actions:

- `ruff`: Runs linting and formatting
- `pr-test`: Runs an end-to-end podcast test on the PR
- `build-and-push`: Builds and pushes a new container image to the remote repo. This is used to update production deployments

## Security Considerations

**Important**: This setup uses HTTP and is not intended for production deployments. For production deployments, consider implementing the following security measures:

- Add SSL/TLS encryption by either:
  - Configuring uvicorn with SSL certificates
  - Setting up a reverse proxy (like Nginx) to handle SSL termination
- Implement proper certificate management
- Configure appropriate security headers
- Follow other web security best practices
