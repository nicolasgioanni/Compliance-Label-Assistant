# Assumptions And Limitations

## Assumptions

- The frontend queue stores expected application fields per label and verifies each queued item through `/verify`.
- The backend `/verify-batch` endpoint uses one shared expected application dataset for every uploaded label.
- Users provide expected application fields manually.
- CSV and Excel export are implemented for queue results; CSV import by filename mapping is deferred.
- `sample-data/labels` may contain manually added or generated label images for local testing.
- Deployment URLs are not fixed until the frontend and backend are deployed.
- If `OPENAI_API_KEY` is missing, verification returns a user-facing setup/configuration error.

## Limitations

- The app does not make final legal compliance decisions.
- There is no COLA integration.
- There is no database, authentication, admin dashboard, or persistent uploaded file storage.
- PDF and HEIC/HEIF uploads are not supported in the MVP.
- Government warning bold type, font size/font, and label placement are not verified.
- Extraction quality depends on label image quality and OpenAI API availability.
- The frontend queue is limited to 10 labels.
- Backend batch uploads are limited by `MAX_BATCH_SIZE`, defaulting to 10 files.
