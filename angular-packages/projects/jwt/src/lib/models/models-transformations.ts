import {JwtGroup} from './jwt-group';

export interface ModelsTransformations<JwtGroupType extends JwtGroup, AuthResponse> {
  authResponseToJwt: (authResponse: AuthResponse) => JwtGroupType
}
