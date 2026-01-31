import { ChangeEvent, FormEventHandler, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '../../Components/InputError';
import InputLabel from '../../Components/InputLabel';
import PrimaryButton from '../../Components/PrimaryButton';
import TextInput from '../../Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Stethoscope, Shield } from 'lucide-react';

type UserRole = 'admin' | 'practitioner' | 'client';

export default function Register() {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: '' as UserRole | '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!selectedRole) {
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const roles = [
        {
            id: 'admin' as UserRole,
            title: 'Administrator',
            description: 'Manage operations, staff, and system settings',
            icon: Shield,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500',
        },
        {
            id: 'practitioner' as UserRole,
            title: 'Practitioner',
            description: 'Healthcare providers managing patient care',
            icon: Stethoscope,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500',
        },
        {
            id: 'client' as UserRole,
            title: 'Client',
            description: 'Patients or caregivers booking services',
            icon: User,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500',
        },
    ];

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setData('role', role);
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div className="mb-6">
                    <InputLabel value="Select Account Type" />
                    <div className="mt-2 grid grid-cols-1 gap-3">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;
                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => handleRoleSelect(role.id)}
                                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                                        isSelected
                                            ? `${role.borderColor} ${role.bgColor}`
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${role.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${role.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {role.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {role.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Full Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="phone" value="Phone Number" />
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        placeholder="+255 712 345 678"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)}
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">Required for booking notifications via SMS</p>
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>
                    <PrimaryButton className="ms-4" disabled={processing || !selectedRole}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
