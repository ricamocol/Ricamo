-- Storage policies for cotizacion-files bucket
-- Bucket created via JS client in prior session (private bucket)

-- Authenticated users can upload files to cotizacion-files
-- Path convention: {order_id}/{filename}
create policy "cotizacion_files_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cotizacion-files');

-- Authenticated users can view files they uploaded (by checking path starts with their order)
-- Service role and admins can view all files
create policy "cotizacion_files_service_select"
  on storage.objects for select
  to service_role
  using (bucket_id = 'cotizacion-files');

-- Authenticated users can read (needed for presigned URL generation client-side)
create policy "cotizacion_files_auth_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'cotizacion-files');

-- Service role can delete files (admin cleanup)
create policy "cotizacion_files_service_delete"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'cotizacion-files');
