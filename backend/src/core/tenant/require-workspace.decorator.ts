import { SetMetadata } from '@nestjs/common';

export const REQUIRE_WORKSPACE_KEY = 'requireWorkspace';
export const RequireWorkspace = () => SetMetadata(REQUIRE_WORKSPACE_KEY, true);