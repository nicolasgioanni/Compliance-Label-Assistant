# Assumptions And Limitations

## Assumptions

- Batch mode uses one shared expected application dataset for every uploaded label.
- Users provide expected application fields manually.
- `sample-data/labels` may contain manually added or generated label images for local testing.
- Deployment URLs are not fixed until the frontend and backend are deployed.
- If `OPENAI_API_KEY` is missing, verification returns a user-facing setup/configuration error.

## Limitations

- The app does not make final legal compliance decisions.
- There is no COLA integration.
- There is no database, authentication, admin dashboard, or persistent uploaded file storage.
- Government warning bold text, font size, and placement are not verified.
- Extraction quality depends on label image quality and OpenAI API availability.
- Batch uploads are limited by `MAX_BATCH_SIZE`, defaulting to 10 files.
