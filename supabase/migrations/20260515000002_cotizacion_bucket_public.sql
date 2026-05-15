-- Make cotizacion-files bucket public so stored URLs work without auth tokens
-- Paths are random (UUID-based) so files are not guessable
UPDATE storage.buckets SET public = true WHERE id = 'cotizacion-files';
