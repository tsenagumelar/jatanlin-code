import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { useLoginLazyQuery } from '@/src/graphql/hooks/auth';
import { setLoading, setError, clearError, setUser } from './slice';
import { setAuthCookie } from '@/src/utils/auth';
import type { LoginFormData, User } from './types';

export const useLogin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.login);

  const [loginQuery, { loading: queryLoading, error: queryError }] = useLoginLazyQuery();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    dispatch(clearError());
    dispatch(setLoading(true));

    try {
      const result = await loginQuery({
        variables: {
          usernameOrEmail: formData.email,
          password: formData.password,
        },
      });

      if (result.data?.master_user && result.data.master_user.length > 0) {
        const userData = result.data.master_user[0];

        // Transform GraphQL data to User type
        const user: User = {
          id: userData.id as string,
          code: userData.code,
          badge_no: userData.badge_no ?? null,
          username: userData.username,
          email: userData.email ?? null,
          full_name: userData.full_name,
          profile_picture: userData.profile_picture ?? null,
          is_active: userData.is_active ?? null,
          master_role: {
            id: userData.master_role.id as string,
            code: userData.master_role.code,
            role_name: userData.master_role.role_name,
            description: userData.master_role.description ?? null,
          },
        };

        // Save user to Redux
        dispatch(setUser(user));

        // Set auth cookie
        setAuthCookie(true);

        // Navigate to main v2 dashboard
        router.push('/v2/dashboard');
      } else {
        dispatch(setError('Email/nama pengguna atau kata sandi salah'));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat login';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handle GraphQL query errors
  useEffect(() => {
    if (queryError) {
      dispatch(setError('Terjadi kesalahan saat menghubungi server'));
      dispatch(setLoading(false));
    }
  }, [queryError, dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/v2/dashboard');
    }
  }, [isAuthenticated, router]);

  return {
    formData,
    isLoading: isLoading || queryLoading,
    error,
    isAuthenticated,
    handleChange,
    handleSubmit,
  };
};
