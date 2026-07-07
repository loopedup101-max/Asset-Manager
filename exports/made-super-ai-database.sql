--
-- PostgreSQL database dump
--

\restrict JhcWu3zSRZUZBQmbDPoHjyBqLhJc23qpxyzE1i6saTungKEWnN3bvkjLDyakY5E

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: stripe; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA stripe;


--
-- Name: invoice_status; Type: TYPE; Schema: stripe; Owner: -
--

CREATE TYPE stripe.invoice_status AS ENUM (
    'draft',
    'open',
    'paid',
    'uncollectible',
    'void',
    'deleted'
);


--
-- Name: pricing_tiers; Type: TYPE; Schema: stripe; Owner: -
--

CREATE TYPE stripe.pricing_tiers AS ENUM (
    'graduated',
    'volume'
);


--
-- Name: pricing_type; Type: TYPE; Schema: stripe; Owner: -
--

CREATE TYPE stripe.pricing_type AS ENUM (
    'one_time',
    'recurring'
);


--
-- Name: subscription_schedule_status; Type: TYPE; Schema: stripe; Owner: -
--

CREATE TYPE stripe.subscription_schedule_status AS ENUM (
    'not_started',
    'active',
    'completed',
    'released',
    'canceled'
);


--
-- Name: subscription_status; Type: TYPE; Schema: stripe; Owner: -
--

CREATE TYPE stripe.subscription_status AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused'
);


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new._updated_at = now();
  return NEW;
end;
$$;


--
-- Name: set_updated_at_metadata(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_metadata() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return NEW;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    title text DEFAULT 'New Conversation'::text NOT NULL,
    last_message text,
    message_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id text
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: sent_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sent_emails (
    id integer NOT NULL,
    user_id text NOT NULL,
    to_address text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    from_address text,
    gmail_message_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sent_emails_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sent_emails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sent_emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sent_emails_id_seq OWNED BY public.sent_emails.id;


--
-- Name: social_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_accounts (
    id integer NOT NULL,
    platform text NOT NULL,
    username text NOT NULL,
    connected boolean DEFAULT true NOT NULL,
    api_key text,
    api_secret text,
    access_token text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: social_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.social_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: social_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.social_accounts_id_seq OWNED BY public.social_accounts.id;


--
-- Name: social_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_posts (
    id integer NOT NULL,
    platform text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    post_type text DEFAULT 'text'::text NOT NULL,
    video_script text,
    scheduled_at timestamp without time zone,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: social_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.social_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: social_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.social_posts_id_seq OWNED BY public.social_posts.id;


--
-- Name: usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage (
    id integer NOT NULL,
    user_id text NOT NULL,
    period text NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: usage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usage_id_seq OWNED BY public.usage.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text,
    role text DEFAULT 'user'::text NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    trial_started_at timestamp without time zone
);


--
-- Name: _managed_webhooks; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe._managed_webhooks (
    id text NOT NULL,
    object text,
    url text NOT NULL,
    enabled_events jsonb NOT NULL,
    description text,
    enabled boolean,
    livemode boolean,
    metadata jsonb,
    secret text NOT NULL,
    status text,
    api_version text,
    created integer,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_synced_at timestamp with time zone,
    account_id text NOT NULL
);


--
-- Name: _migrations; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe._migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: _sync_status; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe._sync_status (
    id integer NOT NULL,
    resource text NOT NULL,
    status text DEFAULT 'idle'::text,
    last_synced_at timestamp with time zone DEFAULT now(),
    last_incremental_cursor timestamp with time zone,
    error_message text,
    updated_at timestamp with time zone DEFAULT now(),
    account_id text NOT NULL,
    CONSTRAINT _sync_status_status_check CHECK ((status = ANY (ARRAY['idle'::text, 'running'::text, 'complete'::text, 'error'::text])))
);


--
-- Name: _sync_status_id_seq; Type: SEQUENCE; Schema: stripe; Owner: -
--

CREATE SEQUENCE stripe._sync_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _sync_status_id_seq; Type: SEQUENCE OWNED BY; Schema: stripe; Owner: -
--

ALTER SEQUENCE stripe._sync_status_id_seq OWNED BY stripe._sync_status.id;


--
-- Name: accounts; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.accounts (
    _raw_data jsonb NOT NULL,
    first_synced_at timestamp with time zone DEFAULT now() NOT NULL,
    _last_synced_at timestamp with time zone DEFAULT now() NOT NULL,
    _updated_at timestamp with time zone DEFAULT now() NOT NULL,
    business_name text GENERATED ALWAYS AS (((_raw_data -> 'business_profile'::text) ->> 'name'::text)) STORED,
    email text GENERATED ALWAYS AS ((_raw_data ->> 'email'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    charges_enabled boolean GENERATED ALWAYS AS (((_raw_data ->> 'charges_enabled'::text))::boolean) STORED,
    payouts_enabled boolean GENERATED ALWAYS AS (((_raw_data ->> 'payouts_enabled'::text))::boolean) STORED,
    details_submitted boolean GENERATED ALWAYS AS (((_raw_data ->> 'details_submitted'::text))::boolean) STORED,
    country text GENERATED ALWAYS AS ((_raw_data ->> 'country'::text)) STORED,
    default_currency text GENERATED ALWAYS AS ((_raw_data ->> 'default_currency'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    api_key_hashes text[] DEFAULT '{}'::text[],
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: active_entitlements; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.active_entitlements (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    feature text GENERATED ALWAYS AS ((_raw_data ->> 'feature'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    lookup_key text GENERATED ALWAYS AS ((_raw_data ->> 'lookup_key'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: charges; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.charges (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    paid boolean GENERATED ALWAYS AS (((_raw_data ->> 'paid'::text))::boolean) STORED,
    "order" text GENERATED ALWAYS AS ((_raw_data ->> 'order'::text)) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    review text GENERATED ALWAYS AS ((_raw_data ->> 'review'::text)) STORED,
    source jsonb GENERATED ALWAYS AS ((_raw_data -> 'source'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    dispute text GENERATED ALWAYS AS ((_raw_data ->> 'dispute'::text)) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    outcome jsonb GENERATED ALWAYS AS ((_raw_data -> 'outcome'::text)) STORED,
    refunds jsonb GENERATED ALWAYS AS ((_raw_data -> 'refunds'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    captured boolean GENERATED ALWAYS AS (((_raw_data ->> 'captured'::text))::boolean) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    refunded boolean GENERATED ALWAYS AS (((_raw_data ->> 'refunded'::text))::boolean) STORED,
    shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping'::text)) STORED,
    application text GENERATED ALWAYS AS ((_raw_data ->> 'application'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    destination text GENERATED ALWAYS AS ((_raw_data ->> 'destination'::text)) STORED,
    failure_code text GENERATED ALWAYS AS ((_raw_data ->> 'failure_code'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    fraud_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'fraud_details'::text)) STORED,
    receipt_email text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_email'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    receipt_number text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_number'::text)) STORED,
    transfer_group text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_group'::text)) STORED,
    amount_refunded bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_refunded'::text))::bigint) STORED,
    application_fee text GENERATED ALWAYS AS ((_raw_data ->> 'application_fee'::text)) STORED,
    failure_message text GENERATED ALWAYS AS ((_raw_data ->> 'failure_message'::text)) STORED,
    source_transfer text GENERATED ALWAYS AS ((_raw_data ->> 'source_transfer'::text)) STORED,
    balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'balance_transaction'::text)) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    payment_method_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_details'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: checkout_session_line_items; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.checkout_session_line_items (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount_discount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_discount'::text))::integer) STORED,
    amount_subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_subtotal'::text))::integer) STORED,
    amount_tax integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_tax'::text))::integer) STORED,
    amount_total integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_total'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    price text GENERATED ALWAYS AS ((_raw_data ->> 'price'::text)) STORED,
    quantity integer GENERATED ALWAYS AS (((_raw_data ->> 'quantity'::text))::integer) STORED,
    checkout_session text GENERATED ALWAYS AS ((_raw_data ->> 'checkout_session'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: checkout_sessions; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.checkout_sessions (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    adaptive_pricing jsonb GENERATED ALWAYS AS ((_raw_data -> 'adaptive_pricing'::text)) STORED,
    after_expiration jsonb GENERATED ALWAYS AS ((_raw_data -> 'after_expiration'::text)) STORED,
    allow_promotion_codes boolean GENERATED ALWAYS AS (((_raw_data ->> 'allow_promotion_codes'::text))::boolean) STORED,
    amount_subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_subtotal'::text))::integer) STORED,
    amount_total integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_total'::text))::integer) STORED,
    automatic_tax jsonb GENERATED ALWAYS AS ((_raw_data -> 'automatic_tax'::text)) STORED,
    billing_address_collection text GENERATED ALWAYS AS ((_raw_data ->> 'billing_address_collection'::text)) STORED,
    cancel_url text GENERATED ALWAYS AS ((_raw_data ->> 'cancel_url'::text)) STORED,
    client_reference_id text GENERATED ALWAYS AS ((_raw_data ->> 'client_reference_id'::text)) STORED,
    client_secret text GENERATED ALWAYS AS ((_raw_data ->> 'client_secret'::text)) STORED,
    collected_information jsonb GENERATED ALWAYS AS ((_raw_data -> 'collected_information'::text)) STORED,
    consent jsonb GENERATED ALWAYS AS ((_raw_data -> 'consent'::text)) STORED,
    consent_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'consent_collection'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    currency_conversion jsonb GENERATED ALWAYS AS ((_raw_data -> 'currency_conversion'::text)) STORED,
    custom_fields jsonb GENERATED ALWAYS AS ((_raw_data -> 'custom_fields'::text)) STORED,
    custom_text jsonb GENERATED ALWAYS AS ((_raw_data -> 'custom_text'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    customer_creation text GENERATED ALWAYS AS ((_raw_data ->> 'customer_creation'::text)) STORED,
    customer_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_details'::text)) STORED,
    customer_email text GENERATED ALWAYS AS ((_raw_data ->> 'customer_email'::text)) STORED,
    discounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'discounts'::text)) STORED,
    expires_at integer GENERATED ALWAYS AS (((_raw_data ->> 'expires_at'::text))::integer) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    invoice_creation jsonb GENERATED ALWAYS AS ((_raw_data -> 'invoice_creation'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    locale text GENERATED ALWAYS AS ((_raw_data ->> 'locale'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    mode text GENERATED ALWAYS AS ((_raw_data ->> 'mode'::text)) STORED,
    optional_items jsonb GENERATED ALWAYS AS ((_raw_data -> 'optional_items'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    payment_link text GENERATED ALWAYS AS ((_raw_data ->> 'payment_link'::text)) STORED,
    payment_method_collection text GENERATED ALWAYS AS ((_raw_data ->> 'payment_method_collection'::text)) STORED,
    payment_method_configuration_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_configuration_details'::text)) STORED,
    payment_method_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_options'::text)) STORED,
    payment_method_types jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_types'::text)) STORED,
    payment_status text GENERATED ALWAYS AS ((_raw_data ->> 'payment_status'::text)) STORED,
    permissions jsonb GENERATED ALWAYS AS ((_raw_data -> 'permissions'::text)) STORED,
    phone_number_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'phone_number_collection'::text)) STORED,
    presentment_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'presentment_details'::text)) STORED,
    recovered_from text GENERATED ALWAYS AS ((_raw_data ->> 'recovered_from'::text)) STORED,
    redirect_on_completion text GENERATED ALWAYS AS ((_raw_data ->> 'redirect_on_completion'::text)) STORED,
    return_url text GENERATED ALWAYS AS ((_raw_data ->> 'return_url'::text)) STORED,
    saved_payment_method_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'saved_payment_method_options'::text)) STORED,
    setup_intent text GENERATED ALWAYS AS ((_raw_data ->> 'setup_intent'::text)) STORED,
    shipping_address_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_address_collection'::text)) STORED,
    shipping_cost jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_cost'::text)) STORED,
    shipping_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_details'::text)) STORED,
    shipping_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_options'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    submit_type text GENERATED ALWAYS AS ((_raw_data ->> 'submit_type'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    success_url text GENERATED ALWAYS AS ((_raw_data ->> 'success_url'::text)) STORED,
    tax_id_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'tax_id_collection'::text)) STORED,
    total_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'total_details'::text)) STORED,
    ui_mode text GENERATED ALWAYS AS ((_raw_data ->> 'ui_mode'::text)) STORED,
    url text GENERATED ALWAYS AS ((_raw_data ->> 'url'::text)) STORED,
    wallet_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'wallet_options'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: coupons; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.coupons (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    valid boolean GENERATED ALWAYS AS (((_raw_data ->> 'valid'::text))::boolean) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    duration text GENERATED ALWAYS AS ((_raw_data ->> 'duration'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    redeem_by integer GENERATED ALWAYS AS (((_raw_data ->> 'redeem_by'::text))::integer) STORED,
    amount_off bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_off'::text))::bigint) STORED,
    percent_off double precision GENERATED ALWAYS AS (((_raw_data ->> 'percent_off'::text))::double precision) STORED,
    times_redeemed bigint GENERATED ALWAYS AS (((_raw_data ->> 'times_redeemed'::text))::bigint) STORED,
    max_redemptions bigint GENERATED ALWAYS AS (((_raw_data ->> 'max_redemptions'::text))::bigint) STORED,
    duration_in_months bigint GENERATED ALWAYS AS (((_raw_data ->> 'duration_in_months'::text))::bigint) STORED,
    percent_off_precise double precision GENERATED ALWAYS AS (((_raw_data ->> 'percent_off_precise'::text))::double precision) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: credit_notes; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.credit_notes (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::integer) STORED,
    amount_shipping integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_shipping'::text))::integer) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    customer_balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'customer_balance_transaction'::text)) STORED,
    discount_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'discount_amount'::text))::integer) STORED,
    discount_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount_amounts'::text)) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    lines jsonb GENERATED ALWAYS AS ((_raw_data -> 'lines'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    memo text GENERATED ALWAYS AS ((_raw_data ->> 'memo'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    number text GENERATED ALWAYS AS ((_raw_data ->> 'number'::text)) STORED,
    out_of_band_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'out_of_band_amount'::text))::integer) STORED,
    pdf text GENERATED ALWAYS AS ((_raw_data ->> 'pdf'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    refund text GENERATED ALWAYS AS ((_raw_data ->> 'refund'::text)) STORED,
    shipping_cost jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_cost'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'subtotal'::text))::integer) STORED,
    subtotal_excluding_tax integer GENERATED ALWAYS AS (((_raw_data ->> 'subtotal_excluding_tax'::text))::integer) STORED,
    tax_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'tax_amounts'::text)) STORED,
    total integer GENERATED ALWAYS AS (((_raw_data ->> 'total'::text))::integer) STORED,
    total_excluding_tax integer GENERATED ALWAYS AS (((_raw_data ->> 'total_excluding_tax'::text))::integer) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    voided_at text GENERATED ALWAYS AS ((_raw_data ->> 'voided_at'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.customers (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    address jsonb GENERATED ALWAYS AS ((_raw_data -> 'address'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    email text GENERATED ALWAYS AS ((_raw_data ->> 'email'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    phone text GENERATED ALWAYS AS ((_raw_data ->> 'phone'::text)) STORED,
    shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping'::text)) STORED,
    balance integer GENERATED ALWAYS AS (((_raw_data ->> 'balance'::text))::integer) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    default_source text GENERATED ALWAYS AS ((_raw_data ->> 'default_source'::text)) STORED,
    delinquent boolean GENERATED ALWAYS AS (((_raw_data ->> 'delinquent'::text))::boolean) STORED,
    discount jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount'::text)) STORED,
    invoice_prefix text GENERATED ALWAYS AS ((_raw_data ->> 'invoice_prefix'::text)) STORED,
    invoice_settings jsonb GENERATED ALWAYS AS ((_raw_data -> 'invoice_settings'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    next_invoice_sequence integer GENERATED ALWAYS AS (((_raw_data ->> 'next_invoice_sequence'::text))::integer) STORED,
    preferred_locales jsonb GENERATED ALWAYS AS ((_raw_data -> 'preferred_locales'::text)) STORED,
    tax_exempt text GENERATED ALWAYS AS ((_raw_data ->> 'tax_exempt'::text)) STORED,
    deleted boolean GENERATED ALWAYS AS (((_raw_data ->> 'deleted'::text))::boolean) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: disputes; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.disputes (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    evidence jsonb GENERATED ALWAYS AS ((_raw_data -> 'evidence'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    evidence_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'evidence_details'::text)) STORED,
    balance_transactions jsonb GENERATED ALWAYS AS ((_raw_data -> 'balance_transactions'::text)) STORED,
    is_charge_refundable boolean GENERATED ALWAYS AS (((_raw_data ->> 'is_charge_refundable'::text))::boolean) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: early_fraud_warnings; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.early_fraud_warnings (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    actionable boolean GENERATED ALWAYS AS (((_raw_data ->> 'actionable'::text))::boolean) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    fraud_type text GENERATED ALWAYS AS ((_raw_data ->> 'fraud_type'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.events (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    data jsonb GENERATED ALWAYS AS ((_raw_data -> 'data'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    request text GENERATED ALWAYS AS ((_raw_data ->> 'request'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    api_version text GENERATED ALWAYS AS ((_raw_data ->> 'api_version'::text)) STORED,
    pending_webhooks bigint GENERATED ALWAYS AS (((_raw_data ->> 'pending_webhooks'::text))::bigint) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: features; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.features (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    lookup_key text GENERATED ALWAYS AS ((_raw_data ->> 'lookup_key'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.invoices (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    auto_advance boolean GENERATED ALWAYS AS (((_raw_data ->> 'auto_advance'::text))::boolean) STORED,
    collection_method text GENERATED ALWAYS AS ((_raw_data ->> 'collection_method'::text)) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    hosted_invoice_url text GENERATED ALWAYS AS ((_raw_data ->> 'hosted_invoice_url'::text)) STORED,
    lines jsonb GENERATED ALWAYS AS ((_raw_data -> 'lines'::text)) STORED,
    period_end integer GENERATED ALWAYS AS (((_raw_data ->> 'period_end'::text))::integer) STORED,
    period_start integer GENERATED ALWAYS AS (((_raw_data ->> 'period_start'::text))::integer) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    total bigint GENERATED ALWAYS AS (((_raw_data ->> 'total'::text))::bigint) STORED,
    account_country text GENERATED ALWAYS AS ((_raw_data ->> 'account_country'::text)) STORED,
    account_name text GENERATED ALWAYS AS ((_raw_data ->> 'account_name'::text)) STORED,
    account_tax_ids jsonb GENERATED ALWAYS AS ((_raw_data -> 'account_tax_ids'::text)) STORED,
    amount_due bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_due'::text))::bigint) STORED,
    amount_paid bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_paid'::text))::bigint) STORED,
    amount_remaining bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_remaining'::text))::bigint) STORED,
    application_fee_amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'application_fee_amount'::text))::bigint) STORED,
    attempt_count integer GENERATED ALWAYS AS (((_raw_data ->> 'attempt_count'::text))::integer) STORED,
    attempted boolean GENERATED ALWAYS AS (((_raw_data ->> 'attempted'::text))::boolean) STORED,
    billing_reason text GENERATED ALWAYS AS ((_raw_data ->> 'billing_reason'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    custom_fields jsonb GENERATED ALWAYS AS ((_raw_data -> 'custom_fields'::text)) STORED,
    customer_address jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_address'::text)) STORED,
    customer_email text GENERATED ALWAYS AS ((_raw_data ->> 'customer_email'::text)) STORED,
    customer_name text GENERATED ALWAYS AS ((_raw_data ->> 'customer_name'::text)) STORED,
    customer_phone text GENERATED ALWAYS AS ((_raw_data ->> 'customer_phone'::text)) STORED,
    customer_shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_shipping'::text)) STORED,
    customer_tax_exempt text GENERATED ALWAYS AS ((_raw_data ->> 'customer_tax_exempt'::text)) STORED,
    customer_tax_ids jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_tax_ids'::text)) STORED,
    default_tax_rates jsonb GENERATED ALWAYS AS ((_raw_data -> 'default_tax_rates'::text)) STORED,
    discount jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount'::text)) STORED,
    discounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'discounts'::text)) STORED,
    due_date integer GENERATED ALWAYS AS (((_raw_data ->> 'due_date'::text))::integer) STORED,
    ending_balance integer GENERATED ALWAYS AS (((_raw_data ->> 'ending_balance'::text))::integer) STORED,
    footer text GENERATED ALWAYS AS ((_raw_data ->> 'footer'::text)) STORED,
    invoice_pdf text GENERATED ALWAYS AS ((_raw_data ->> 'invoice_pdf'::text)) STORED,
    last_finalization_error jsonb GENERATED ALWAYS AS ((_raw_data -> 'last_finalization_error'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    next_payment_attempt integer GENERATED ALWAYS AS (((_raw_data ->> 'next_payment_attempt'::text))::integer) STORED,
    number text GENERATED ALWAYS AS ((_raw_data ->> 'number'::text)) STORED,
    paid boolean GENERATED ALWAYS AS (((_raw_data ->> 'paid'::text))::boolean) STORED,
    payment_settings jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_settings'::text)) STORED,
    post_payment_credit_notes_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'post_payment_credit_notes_amount'::text))::integer) STORED,
    pre_payment_credit_notes_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'pre_payment_credit_notes_amount'::text))::integer) STORED,
    receipt_number text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_number'::text)) STORED,
    starting_balance integer GENERATED ALWAYS AS (((_raw_data ->> 'starting_balance'::text))::integer) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    status_transitions jsonb GENERATED ALWAYS AS ((_raw_data -> 'status_transitions'::text)) STORED,
    subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'subtotal'::text))::integer) STORED,
    tax integer GENERATED ALWAYS AS (((_raw_data ->> 'tax'::text))::integer) STORED,
    total_discount_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'total_discount_amounts'::text)) STORED,
    total_tax_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'total_tax_amounts'::text)) STORED,
    transfer_data jsonb GENERATED ALWAYS AS ((_raw_data -> 'transfer_data'::text)) STORED,
    webhooks_delivered_at integer GENERATED ALWAYS AS (((_raw_data ->> 'webhooks_delivered_at'::text))::integer) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    default_payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'default_payment_method'::text)) STORED,
    default_source text GENERATED ALWAYS AS ((_raw_data ->> 'default_source'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: payment_intents; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.payment_intents (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::integer) STORED,
    amount_capturable integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_capturable'::text))::integer) STORED,
    amount_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'amount_details'::text)) STORED,
    amount_received integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_received'::text))::integer) STORED,
    application text GENERATED ALWAYS AS ((_raw_data ->> 'application'::text)) STORED,
    application_fee_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'application_fee_amount'::text))::integer) STORED,
    automatic_payment_methods text GENERATED ALWAYS AS ((_raw_data ->> 'automatic_payment_methods'::text)) STORED,
    canceled_at integer GENERATED ALWAYS AS (((_raw_data ->> 'canceled_at'::text))::integer) STORED,
    cancellation_reason text GENERATED ALWAYS AS ((_raw_data ->> 'cancellation_reason'::text)) STORED,
    capture_method text GENERATED ALWAYS AS ((_raw_data ->> 'capture_method'::text)) STORED,
    client_secret text GENERATED ALWAYS AS ((_raw_data ->> 'client_secret'::text)) STORED,
    confirmation_method text GENERATED ALWAYS AS ((_raw_data ->> 'confirmation_method'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    last_payment_error text GENERATED ALWAYS AS ((_raw_data ->> 'last_payment_error'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    next_action text GENERATED ALWAYS AS ((_raw_data ->> 'next_action'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'payment_method'::text)) STORED,
    payment_method_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_options'::text)) STORED,
    payment_method_types jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_types'::text)) STORED,
    processing text GENERATED ALWAYS AS ((_raw_data ->> 'processing'::text)) STORED,
    receipt_email text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_email'::text)) STORED,
    review text GENERATED ALWAYS AS ((_raw_data ->> 'review'::text)) STORED,
    setup_future_usage text GENERATED ALWAYS AS ((_raw_data ->> 'setup_future_usage'::text)) STORED,
    shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping'::text)) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    statement_descriptor_suffix text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor_suffix'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    transfer_data jsonb GENERATED ALWAYS AS ((_raw_data -> 'transfer_data'::text)) STORED,
    transfer_group text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_group'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: payment_methods; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.payment_methods (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    billing_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'billing_details'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    card jsonb GENERATED ALWAYS AS ((_raw_data -> 'card'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: payouts; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.payouts (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    date text GENERATED ALWAYS AS ((_raw_data ->> 'date'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    method text GENERATED ALWAYS AS ((_raw_data ->> 'method'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    automatic boolean GENERATED ALWAYS AS (((_raw_data ->> 'automatic'::text))::boolean) STORED,
    recipient text GENERATED ALWAYS AS ((_raw_data ->> 'recipient'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    destination text GENERATED ALWAYS AS ((_raw_data ->> 'destination'::text)) STORED,
    source_type text GENERATED ALWAYS AS ((_raw_data ->> 'source_type'::text)) STORED,
    arrival_date text GENERATED ALWAYS AS ((_raw_data ->> 'arrival_date'::text)) STORED,
    bank_account jsonb GENERATED ALWAYS AS ((_raw_data -> 'bank_account'::text)) STORED,
    failure_code text GENERATED ALWAYS AS ((_raw_data ->> 'failure_code'::text)) STORED,
    transfer_group text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_group'::text)) STORED,
    amount_reversed bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_reversed'::text))::bigint) STORED,
    failure_message text GENERATED ALWAYS AS ((_raw_data ->> 'failure_message'::text)) STORED,
    source_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'source_transaction'::text)) STORED,
    balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'balance_transaction'::text)) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    statement_description text GENERATED ALWAYS AS ((_raw_data ->> 'statement_description'::text)) STORED,
    failure_balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'failure_balance_transaction'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: plans; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.plans (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    tiers jsonb GENERATED ALWAYS AS ((_raw_data -> 'tiers'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    product text GENERATED ALWAYS AS ((_raw_data ->> 'product'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    "interval" text GENERATED ALWAYS AS ((_raw_data ->> 'interval'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    nickname text GENERATED ALWAYS AS ((_raw_data ->> 'nickname'::text)) STORED,
    tiers_mode text GENERATED ALWAYS AS ((_raw_data ->> 'tiers_mode'::text)) STORED,
    usage_type text GENERATED ALWAYS AS ((_raw_data ->> 'usage_type'::text)) STORED,
    billing_scheme text GENERATED ALWAYS AS ((_raw_data ->> 'billing_scheme'::text)) STORED,
    interval_count bigint GENERATED ALWAYS AS (((_raw_data ->> 'interval_count'::text))::bigint) STORED,
    aggregate_usage text GENERATED ALWAYS AS ((_raw_data ->> 'aggregate_usage'::text)) STORED,
    transform_usage text GENERATED ALWAYS AS ((_raw_data ->> 'transform_usage'::text)) STORED,
    trial_period_days bigint GENERATED ALWAYS AS (((_raw_data ->> 'trial_period_days'::text))::bigint) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    statement_description text GENERATED ALWAYS AS ((_raw_data ->> 'statement_description'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: prices; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.prices (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    nickname text GENERATED ALWAYS AS ((_raw_data ->> 'nickname'::text)) STORED,
    recurring jsonb GENERATED ALWAYS AS ((_raw_data -> 'recurring'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    unit_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'unit_amount'::text))::integer) STORED,
    billing_scheme text GENERATED ALWAYS AS ((_raw_data ->> 'billing_scheme'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    lookup_key text GENERATED ALWAYS AS ((_raw_data ->> 'lookup_key'::text)) STORED,
    tiers_mode text GENERATED ALWAYS AS ((_raw_data ->> 'tiers_mode'::text)) STORED,
    transform_quantity jsonb GENERATED ALWAYS AS ((_raw_data -> 'transform_quantity'::text)) STORED,
    unit_amount_decimal text GENERATED ALWAYS AS ((_raw_data ->> 'unit_amount_decimal'::text)) STORED,
    product text GENERATED ALWAYS AS ((_raw_data ->> 'product'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.products (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    default_price text GENERATED ALWAYS AS ((_raw_data ->> 'default_price'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    images jsonb GENERATED ALWAYS AS ((_raw_data -> 'images'::text)) STORED,
    marketing_features jsonb GENERATED ALWAYS AS ((_raw_data -> 'marketing_features'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    package_dimensions jsonb GENERATED ALWAYS AS ((_raw_data -> 'package_dimensions'::text)) STORED,
    shippable boolean GENERATED ALWAYS AS (((_raw_data ->> 'shippable'::text))::boolean) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    unit_label text GENERATED ALWAYS AS ((_raw_data ->> 'unit_label'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    url text GENERATED ALWAYS AS ((_raw_data ->> 'url'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: refunds; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.refunds (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::integer) STORED,
    balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'balance_transaction'::text)) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    destination_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'destination_details'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    receipt_number text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_number'::text)) STORED,
    source_transfer_reversal text GENERATED ALWAYS AS ((_raw_data ->> 'source_transfer_reversal'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    transfer_reversal text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_reversal'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.reviews (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    billing_zip text GENERATED ALWAYS AS ((_raw_data ->> 'billing_zip'::text)) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    closed_reason text GENERATED ALWAYS AS ((_raw_data ->> 'closed_reason'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    ip_address text GENERATED ALWAYS AS ((_raw_data ->> 'ip_address'::text)) STORED,
    ip_address_location jsonb GENERATED ALWAYS AS ((_raw_data -> 'ip_address_location'::text)) STORED,
    open boolean GENERATED ALWAYS AS (((_raw_data ->> 'open'::text))::boolean) STORED,
    opened_reason text GENERATED ALWAYS AS ((_raw_data ->> 'opened_reason'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    session text GENERATED ALWAYS AS ((_raw_data ->> 'session'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: setup_intents; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.setup_intents (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'payment_method'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    usage text GENERATED ALWAYS AS ((_raw_data ->> 'usage'::text)) STORED,
    cancellation_reason text GENERATED ALWAYS AS ((_raw_data ->> 'cancellation_reason'::text)) STORED,
    latest_attempt text GENERATED ALWAYS AS ((_raw_data ->> 'latest_attempt'::text)) STORED,
    mandate text GENERATED ALWAYS AS ((_raw_data ->> 'mandate'::text)) STORED,
    single_use_mandate text GENERATED ALWAYS AS ((_raw_data ->> 'single_use_mandate'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: subscription_items; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.subscription_items (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    billing_thresholds jsonb GENERATED ALWAYS AS ((_raw_data -> 'billing_thresholds'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    deleted boolean GENERATED ALWAYS AS (((_raw_data ->> 'deleted'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    quantity integer GENERATED ALWAYS AS (((_raw_data ->> 'quantity'::text))::integer) STORED,
    price text GENERATED ALWAYS AS ((_raw_data ->> 'price'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    tax_rates jsonb GENERATED ALWAYS AS ((_raw_data -> 'tax_rates'::text)) STORED,
    current_period_end integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_end'::text))::integer) STORED,
    current_period_start integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_start'::text))::integer) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: subscription_schedules; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.subscription_schedules (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    application text GENERATED ALWAYS AS ((_raw_data ->> 'application'::text)) STORED,
    canceled_at integer GENERATED ALWAYS AS (((_raw_data ->> 'canceled_at'::text))::integer) STORED,
    completed_at integer GENERATED ALWAYS AS (((_raw_data ->> 'completed_at'::text))::integer) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    current_phase jsonb GENERATED ALWAYS AS ((_raw_data -> 'current_phase'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    default_settings jsonb GENERATED ALWAYS AS ((_raw_data -> 'default_settings'::text)) STORED,
    end_behavior text GENERATED ALWAYS AS ((_raw_data ->> 'end_behavior'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    phases jsonb GENERATED ALWAYS AS ((_raw_data -> 'phases'::text)) STORED,
    released_at integer GENERATED ALWAYS AS (((_raw_data ->> 'released_at'::text))::integer) STORED,
    released_subscription text GENERATED ALWAYS AS ((_raw_data ->> 'released_subscription'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    test_clock text GENERATED ALWAYS AS ((_raw_data ->> 'test_clock'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.subscriptions (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    cancel_at_period_end boolean GENERATED ALWAYS AS (((_raw_data ->> 'cancel_at_period_end'::text))::boolean) STORED,
    current_period_end integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_end'::text))::integer) STORED,
    current_period_start integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_start'::text))::integer) STORED,
    default_payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'default_payment_method'::text)) STORED,
    items jsonb GENERATED ALWAYS AS ((_raw_data -> 'items'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    pending_setup_intent text GENERATED ALWAYS AS ((_raw_data ->> 'pending_setup_intent'::text)) STORED,
    pending_update jsonb GENERATED ALWAYS AS ((_raw_data -> 'pending_update'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    application_fee_percent double precision GENERATED ALWAYS AS (((_raw_data ->> 'application_fee_percent'::text))::double precision) STORED,
    billing_cycle_anchor integer GENERATED ALWAYS AS (((_raw_data ->> 'billing_cycle_anchor'::text))::integer) STORED,
    billing_thresholds jsonb GENERATED ALWAYS AS ((_raw_data -> 'billing_thresholds'::text)) STORED,
    cancel_at integer GENERATED ALWAYS AS (((_raw_data ->> 'cancel_at'::text))::integer) STORED,
    canceled_at integer GENERATED ALWAYS AS (((_raw_data ->> 'canceled_at'::text))::integer) STORED,
    collection_method text GENERATED ALWAYS AS ((_raw_data ->> 'collection_method'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    days_until_due integer GENERATED ALWAYS AS (((_raw_data ->> 'days_until_due'::text))::integer) STORED,
    default_source text GENERATED ALWAYS AS ((_raw_data ->> 'default_source'::text)) STORED,
    default_tax_rates jsonb GENERATED ALWAYS AS ((_raw_data -> 'default_tax_rates'::text)) STORED,
    discount jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount'::text)) STORED,
    ended_at integer GENERATED ALWAYS AS (((_raw_data ->> 'ended_at'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    next_pending_invoice_item_invoice integer GENERATED ALWAYS AS (((_raw_data ->> 'next_pending_invoice_item_invoice'::text))::integer) STORED,
    pause_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'pause_collection'::text)) STORED,
    pending_invoice_item_interval jsonb GENERATED ALWAYS AS ((_raw_data -> 'pending_invoice_item_interval'::text)) STORED,
    start_date integer GENERATED ALWAYS AS (((_raw_data ->> 'start_date'::text))::integer) STORED,
    transfer_data jsonb GENERATED ALWAYS AS ((_raw_data -> 'transfer_data'::text)) STORED,
    trial_end jsonb GENERATED ALWAYS AS ((_raw_data -> 'trial_end'::text)) STORED,
    trial_start jsonb GENERATED ALWAYS AS ((_raw_data -> 'trial_start'::text)) STORED,
    schedule text GENERATED ALWAYS AS ((_raw_data ->> 'schedule'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    latest_invoice text GENERATED ALWAYS AS ((_raw_data ->> 'latest_invoice'::text)) STORED,
    plan text GENERATED ALWAYS AS ((_raw_data ->> 'plan'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: tax_ids; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.tax_ids (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    country text GENERATED ALWAYS AS ((_raw_data ->> 'country'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    value text GENERATED ALWAYS AS ((_raw_data ->> 'value'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    owner jsonb GENERATED ALWAYS AS ((_raw_data -> 'owner'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: sent_emails id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_emails ALTER COLUMN id SET DEFAULT nextval('public.sent_emails_id_seq'::regclass);


--
-- Name: social_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_accounts ALTER COLUMN id SET DEFAULT nextval('public.social_accounts_id_seq'::regclass);


--
-- Name: social_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_posts ALTER COLUMN id SET DEFAULT nextval('public.social_posts_id_seq'::regclass);


--
-- Name: usage id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage ALTER COLUMN id SET DEFAULT nextval('public.usage_id_seq'::regclass);


--
-- Name: _sync_status id; Type: DEFAULT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._sync_status ALTER COLUMN id SET DEFAULT nextval('stripe._sync_status_id_seq'::regclass);


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, title, last_message, message_count, created_at, updated_at, user_id) FROM stdin;
2	Business Strategy	\N	0	2026-06-01 04:07:35.608215	2026-06-01 04:07:35.608215	\N
3	Creative Ideas	\N	0	2026-06-01 04:07:35.660468	2026-06-01 04:07:35.660468	\N
4	New Conversation	\N	0	2026-06-01 04:09:27.701837	2026-06-01 04:09:27.701837	\N
5	Test Chat	What can you help me with?	2	2026-06-01 04:11:00.584699	2026-06-01 04:11:00.656	\N
1	Getting Started	how do I build a REST API?	4	2026-06-01 04:07:35.514814	2026-06-01 04:18:04.418	\N
6	WHAT CAN YOU DO TELL ME NOW	WHAT CAN YOU DO TELL ME NOW	2	2026-06-01 04:25:40.284127	2026-06-01 04:25:55.973	\N
7	MAKE ME AN 8 SECOND VIDEO OF A MAN RIDING A BIKE	MAKE ME AN 8 SECOND VIDEO OF A MAN RIDING A BIKE	2	2026-06-01 04:58:33.754746	2026-06-01 04:59:22.369	\N
8	New Conversation	\N	0	2026-06-01 05:12:22.097009	2026-06-01 05:12:22.097009	\N
9	New Conversation	\N	0	2026-06-01 05:51:41.583705	2026-06-01 05:51:41.583705	\N
10	Hello, what can you do?	Hello, what can you do?	2	2026-06-01 07:38:51.428726	2026-06-01 07:39:08.108	user_3EWfzDA3jdEuNP2nY1dRRFsYDYT
11	what are you products and services you sell	you were suppose to be capable of doing everything you cant do a simple task to do a video what do y	18	2026-06-01 09:18:21.747564	2026-06-01 09:30:21.114	user_3EWh5HzzbFxsvBuHLoLSWqgQZV7
12	New Conversation	\N	0	2026-06-01 18:52:02.583395	2026-06-01 18:52:02.583395	user_3EWh5HzzbFxsvBuHLoLSWqgQZV7
13	New Conversation	\N	0	2026-06-01 21:21:52.05461	2026-06-01 21:21:52.05461	user_3EWh5HzzbFxsvBuHLoLSWqgQZV7
14	hello	how do you feel about going live for the users	4	2026-06-01 22:20:08.493547	2026-06-01 22:23:06.59	user_3EWh5HzzbFxsvBuHLoLSWqgQZV7
15	New Conversation	\N	0	2026-06-01 22:33:36.654358	2026-06-01 22:33:36.654358	user_3EWh5HzzbFxsvBuHLoLSWqgQZV7
16	New Conversation	\N	0	2026-06-01 22:42:53.665469	2026-06-01 22:42:53.665469	user_3EWh5HzzbFxsvBuHLoLSWqgQZV7
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, role, content, created_at) FROM stdin;
1	5	user	What can you help me with?	2026-06-01 04:11:00.648388
2	5	assistant	I understand what you're asking. Let me provide a comprehensive response that addresses the key aspects of your question.\n\n*Note: This is a demo AI response. Made Super AI Agent responses are illustrative only. Always verify important information with qualified professionals.*	2026-06-01 04:11:00.654048
3	1	user	WHAT ALL CAN YOU DO?	2026-06-01 04:11:43.415381
4	1	assistant	That's a great question! Let me think through that carefully. As an AI assistant, I can help you explore this topic from multiple angles.\n\n*Note: This is a demo AI response. Made Super AI Agent responses are illustrative only. Always verify important information with qualified professionals.*	2026-06-01 04:11:43.450668
5	1	user	how do I build a REST API?	2026-06-01 04:18:04.375738
6	1	assistant	Great question about APIs! Here's how I can help:\n\n**Building REST APIs:**\n- Define your endpoints (GET, POST, PUT, PATCH, DELETE)\n- Use Express, FastAPI, or Next.js API routes depending on your stack\n- Always validate inputs with Zod, Joi, or Pydantic\n- Return consistent JSON response shapes with proper HTTP status codes\n\n**Example Express endpoint:**\n```js\napp.post('/api/users', async (req, res) => {\n  const { name, email } = req.body;\n  const user = await db.users.create({ name, email });\n  res.status(201).json(user);\n});\n```\n\n**API Best Practices:**\n- Version your APIs (/api/v1/)\n- Use authentication (JWT or API keys)\n- Rate limit to prevent abuse\n- Document with OpenAPI/Swagger\n\nWhat specific API are you building?	2026-06-01 04:18:04.415473
7	6	user	WHAT CAN YOU DO TELL ME NOW	2026-06-01 04:25:55.859883
8	6	assistant	I'm **Made Super AI Agent** — here's what I can do for you:\n\n**Code & Development:**\n- Build REST APIs and GraphQL endpoints\n- Write frontend components (React, Vue, etc.)\n- Set up databases and write SQL queries\n- Debug errors and fix code issues\n- Review and improve existing code\n\n**Infrastructure & Deployment:**\n- Configure custom domains and DNS\n- Set up SSL certificates\n- Deploy to Vercel, Railway, AWS, or VPS\n- Configure Nginx and reverse proxies\n\n**Architecture & Design:**\n- Design database schemas\n- Plan API structures\n- Choose the right tech stack for your project\n- Security best practices\n\n**AI & Automation:**\n- Build AI-powered features\n- Set up webhooks and automation\n- Integrate third-party APIs (Stripe, Twilio, etc.)\n\n**Just ask me anything** — paste your code, describe your problem, or tell me what you want to build.	2026-06-01 04:25:55.864049
9	7	user	MAKE ME AN 8 SECOND VIDEO OF A MAN RIDING A BIKE	2026-06-01 04:59:13.998852
10	7	assistant	I can’t directly record or export video files here, but I *can* give you a super clear, ready-to-use prompt and setup so you can generate an 8‑second video of a man riding a bike using any AI video tool (like Pika, Runway, Stable Video, etc.).\n\n### 1. Use this prompt in an AI video generator\n\nCopy–paste this into your tool:\n\n> 8-second video of a man riding a bicycle down a city street in the daytime. Medium shot from the side, smooth camera movement, realistic lighting, 1080p. The man is wearing casual clothes (jeans and a t-shirt), riding at a steady pace, light traffic in the background, natural colors, cinematic look.\n\nIf you want something else (cartoon, anime, 3D, etc.), tweak it like:\n\n- “in Pixar-style 3D animation”\n- “anime style with bright colors”\n- “minimalist line-art style”\n\n### 2. Set duration to 8 seconds\n\nIn most tools:\n\n- Look for “Duration” or “Length”\n- Set it to **8 seconds**\n- Resolution: **1920x1080** or **1080x1080** if you want a square/social format\n\n### 3. Optional variations\n\nWant options? Here are a few alternate prompts:\n\n1. **Cinematic, dramatic:**\n\n> 8-second slow-motion shot of a man riding a bicycle through a quiet city street at sunset. Warm golden lighting, cinematic depth of field, camera tracking from behind, dust particles in the air, 1080p.\n\n2. **GoPro vibe:**\n\n> 8-second first-person POV video from a camera mounted on a bicycle, showing handlebars and the road ahead in a sunny park. Trees and people pass by, smooth motion, realistic style, 1080p.\n\n3. **Cartoon / fun:**\n\n> 8-second cartoon-style video of a man happily riding a bicycle through a colorful city, exaggerated animation, bright colors, 2D animation style.\n\n---\n\nIf you tell me:\n- which tool you’re using (Pika, Runway, CapCut, etc.), and  \n- what style you want (realistic, anime, 3D, goofy, cinematic),\n\nI’ll give you a laser-precise prompt plus recommended settings for that exact platform.	2026-06-01 04:59:22.364473
11	10	user	Hello, what can you do?	2026-06-01 07:38:51.55632
12	10	assistant	Short version: pretty much anything you’d reasonably expect a top-tier AI to do for you.\n\nHere’s the useful breakdown so you don’t have to guess:\n\n### 1. Build & ship software\n- Design full apps (web, mobile concepts, SaaS tools, dashboards, games).\n- Write production-level code (frontend, backend, APIs, databases).\n- Debug, refactor, and optimize existing code you paste in.\n- Design architecture, data models, and deployment strategies.\n- Generate single-file HTML apps you can run instantly, or help you use your own stack (React, Next.js, Django, Node, etc.).\n\n### 2. Create content & media\n- Write: essays, blog posts, newsletters, ad copy, scripts, emails, documentation, books.\n- Plan & script videos (YouTube, TikTok, courses, promos).\n- Structure and outline long-form content (presentations, reports, proposals).\n- Help with branding: names, taglines, positioning, messaging.\n\n### 3. AI video & visuals\n- Plan full video concepts: script, shot list, visuals, voiceover text.\n- Generate prompts for AI images (Midjourney, DALL·E, etc.).\n- Storyboards for animations or explainer videos.\n- Thumbnails, cover concepts, style guides.\n\n### 4. Learning, tutoring, and explanations\n- Explain complex topics simply (math, physics, programming, finance, etc.).\n- Act as a tutor: step-by-step problems, practice questions, feedback.\n- Build learning plans for a skill (e.g., "Become a data scientist in 3 months").\n- Help with exam prep, summaries, and revision notes.\n\n### 5. Business, product, and strategy\n- Ideate and validate business ideas.\n- Draft pitch decks, product specs, roadmaps.\n- Analyze markets, positioning, and pricing strategies.\n- Write SOPs, process docs, and internal policies.\n- Help with metrics, funnels, and basic financial modeling.\n\n### 6. Social media & growth\n- Plan content calendars for Twitter/X, Instagram, TikTok, LinkedIn, etc.\n- Write hooks, captions, threads, scripts, and CTAs.\n- Turn one piece of content into many platform-specific variations.\n- Suggest automation workflows and tools.\n\n### 7. Productivity & personal support\n- Organize projects, to-do systems, and workflows.\n- Draft important messages: negotiations, apologies, outreach, applications.\n- Help with resumes, cover letters, LinkedIn profiles, portfolios.\n- Brainstorm life decisions with structured pros/cons and scenarios.\n\n### 8. Technical troubleshooting & system help\n- Help debug errors and stack traces.\n- Step-by-step instructions for Windows, macOS, Linux tasks.\n- Explain commands before you run them.\n- Suggest safe scripts and automation (you always stay in control).\n\n### 9. Analysis & reasoning\n- Break down arguments, papers, or documents.\n- Compare options and help you choose (tools, frameworks, offers, plans).\n- Analyze datasets you describe or paste (within reason).\n- Simulate scenarios and outcomes.\n\n---\n\nIf you tell me:\n- what you’re trying to do,\n- what tools/skills you have,\n- and how polished you want the result,\n\nI can jump straight into building/solving something concrete for you. What do you want to work on first?	2026-06-01 07:39:08.047206
13	11	user	what are you products and services you sell	2026-06-01 09:18:48.074843
14	11	assistant	Here’s what I can do for you inside Made Super AI — think of it as a suite of “services” you can use on demand:\n\n1. **App Builder (Full Web Apps)**\n   - Design and build complete, production-quality web apps from a description.\n   - Features:\n     - Live preview in the browser\n     - Downloadable code\n     - Modern UI (dashboards, tools, SaaS-style apps, games, etc.)\n     - Frontend logic, basic backend patterns, data models.\n   - Example uses: internal tools, MVPs for startups, calculators, dashboards, landing pages.\n\n2. **Video Studio (AI Video Creation)**\n   - Create full videos from an idea:\n     - Scriptwriting\n     - Scene breakdown\n     - Image generation / visual suggestions\n     - Voiceover lines and timing\n   - Great for: YouTube, TikTok, explainer videos, marketing content, course content.\n\n3. **Code / Engineering Help**\n   - Write, debug, refactor, and explain code in almost any language.\n   - Design system architecture and databases.\n   - Help with:\n     - APIs and integrations\n     - Performance optimizations\n     - Code reviews and best practices\n     - DevOps guidance (at a high level).\n\n4. **Content & Copywriting**\n   - Long-form and short-form content:\n     - Blogs, articles, newsletters\n     - Social posts, threads, hooks\n     - Sales pages, landing copy, emails\n   - Tone can be professional, casual, technical, or branded to your style.\n\n5. **Social Media & Marketing Support**\n   - Strategy: positioning, content pillars, posting schedules.\n   - Execution: full content calendars, post templates, scripts, captions, hooks.\n   - Help with funnels, lead magnets, basic email sequences.\n\n6. **Business, Strategy & Planning**\n   - Brainstorm and refine product ideas.\n   - Help with business models, offers, pricing logic, and positioning.\n   - Draft pitch decks, outlines, and strategy docs.\n\n7. **Education & Expert Q&A**\n   - Explain complex topics in any field (tech, science, finance, humanities, etc.).\n   - Create:\n     - Study plans\n     - Step-by-step learning paths\n     - Practice questions and explanations.\n\n8. **Writing & Editing**\n   - Rewrite, polish, or restructure documents:\n     - Reports, essays, resumes, cover letters\n     - Scripts, stories, books, outlines\n   - Improve clarity, flow, and grammar; adapt to different audiences.\n\n9. **Problem-Solving & Analysis**\n   - Analyze data you describe or paste.\n   - Help reason through decisions, tradeoffs, and options.\n   - Create frameworks, checklists, and comparison tables.\n\n---\n\nIf you tell me what you’re trying to accomplish (e.g., “grow my IG,” “launch an app,” “make a YouTube channel,” “pass a class”), I can map out exactly which of these we’ll use and in what order.	2026-06-01 09:18:59.91113
15	11	user	what country is the pope in	2026-06-01 09:19:45.955671
16	11	assistant	The Pope lives in **Vatican City**, which is its own independent country (a tiny city-state) located **inside Rome, Italy**.	2026-06-01 09:19:47.300349
17	11	user	if i  ask you to make videos for my youtube page could you?	2026-06-01 09:20:52.020999
18	11	assistant	Yes, absolutely. I can create everything you need for YouTube videos, except actually uploading them for you.\n\nHere’s what I can do for your channel:\n\n1. **Video concepts & strategy**\n   - Channel niche, series ideas, content calendar\n   - Titles, thumbnails concepts, hooks\n\n2. **Full video scripts**\n   - Intro hooks that keep people watching\n   - Main content with clear structure\n   - CTAs (like, subscribe, etc.)\n   - Adjusted to your style: educational, funny, storytelling, review, etc.\n\n3. **Visual planning**\n   - Shot-by-shot breakdowns\n   - On-screen text ideas\n   - B-roll suggestions\n   - Scene descriptions if you’re using AI videos or stock footage\n\n4. **AI video creation workflow**\n   - Generate:\n     - Script\n     - Prompts for AI images/video scenes\n     - Voiceover text\n   - Give you a step-by-step guide to assemble it in tools like CapCut, Canva, Descript, Pictory, etc.\n\n5. **Shorts / TikTok style content**\n   - 15–60 second scripts\n   - Punchy hooks & captions\n   - Ideas optimized for virality\n\n6. **Optimization**\n   - SEO titles, descriptions, tags\n   - Chapter timestamps\n   - Thumbnail text ideas\n\nIf you tell me:\n- Your niche (e.g., gaming, fitness, faith, business, etc.)\n- Your audience (kids, teens, adults, beginners, etc.)\n- Whether you want long-form, shorts, or both\n\n…I can start by:\n- Creating 5–10 video ideas\n- Writing a full script for one of them\n- Giving you a checklist for recording or assembling it with AI tools.	2026-06-01 09:20:58.719395
19	11	user	i want to find the most profitable nitch on youtube create a page and can you find this out for me?	2026-06-01 09:22:55.997234
20	11	assistant	You can absolutely build a profitable YouTube channel, but there’s a catch:\n\nThere is no single “most profitable niche” for everyone. Profit depends on:\n- CPM (what advertisers pay in that niche)\n- How easy it is to get views\n- How easy it is to sell products/sponsorships in that space\n- Your own skills, interest, and consistency\n\nThat said, some niches are **consistently high-earning**.\n\n## 1. Niches with very high CPM (advertisers pay a lot)\n\nThese are some of the top money niches (from what was true up to 2024):\n\n1. **Make Money Online / Online Business**\n   - Examples: side hustles, freelancing, Amazon FBA, dropshipping, YouTube cash cow channels.\n   - Why profitable:\n     - High CPM (business/finance ads pay big).\n     - Tons of affiliate offers (courses, tools, software).\n   - Downside: very competitive and often saturated.\n\n2. **Finance & Investing**\n   - Examples: stock market, crypto, real estate, personal finance, credit cards, budgeting.\n   - Why profitable:\n     - Some of the **highest CPMs on YouTube.**\n     - Banks, brokerages, apps, and card companies pay well.\n   - Downside: needs trust + some real knowledge, plus regulations.\n\n3. **Tech / Software / AI Tools**\n   - Examples: app reviews, AI tools, tutorials, “how to use [tool] to make money.”\n   - Why profitable:\n     - Software companies pay for sponsorships and affiliates.\n     - Good for tutorials and evergreen content.\n   - Downside: moves fast, you must keep up.\n\n4. **B2B / Marketing / Productivity**\n   - Examples: marketing strategies, sales, productivity, SaaS tools, LinkedIn tips.\n   - Why profitable:\n     - B2B audiences = high value per viewer.\n     - Sponsorships and consulting potential.\n   - Downside: usually attracts a smaller but richer audience.\n\n5. **Health, Fitness, and Self-Improvement**\n   - Examples: weight loss, gym content, diet tips, mental health, habit building.\n   - Why profitable:\n     - Massive audience.\n     - Can sell coaching, programs, supplements, courses.\n   - Downside: very crowded, you need a strong brand/angle.\n\n6. **Education & Skills**\n   - Examples: coding, design, video editing, language learning.\n   - Why profitable:\n     - Courses and mentorship can be sold.\n     - Good affiliate deals (Udemy, tools, etc.).\n   - Downside: more effort to produce high-quality tutorials.\n\n---\n\n## 2. How to choose the best niche *for you* (so you actually stick with it)\n\nPure “most profitable” is dangerous because:\n- If you hate the topic, you’ll quit.\n- Viewers can tell when you’re just chasing money.\n\nBest combo = **high CPM + demand + your interest/skills.**\n\nLet me narrow it down with you. Answer these quickly:\n\n1. Which of these do you like or know something about?\n   - A) Money / side hustles / business  \n   - B) Finance / investing  \n   - C) Tech / AI / software tools  \n   - D) Fitness / health / self-improvement  \n   - E) Education / teaching skills  \n   - F) Something else (tell me)\n\n2. Do you want to:\n   - Be on camera?\n   - Use voice only?\n   - Or fully AI/stock-footage faceless channel?\n\n3. How fast do you want to make money?\n   - ASAP (even if it’s harder work)\n   - I’m okay building for 6–12 months\n\nReply with your answers, and I’ll:\n- Pick a **specific profitable niche** for you (not just category).\n- Give you:\n  - Channel name ideas\n  - Branding angle\n  - 10 video ideas\n  - Script outline for your first video\n\n---\n\n## 3. Example: A very profitable, realistic niche\n\nJust to show you the type of thing I’d design for you:\n\n**Niche:** AI side hustles / “Make money with AI tools”  \n**Why:** combines “make money online” + “tech/AI” → high CPM + high interest.\n\nExample content:\n- “5 AI side hustles you can start with $0”\n- “I made $500 using ChatGPT in one week – here’s how”\n- “Best AI tools for YouTube automation in 2025”\n\nMonetization paths:\n- Ad revenue (good CPM)\n- Affiliate links (AI tools, software)\n- Your own digital products later (templates, prompts, guides)\n\nIf you like this type of niche, I can fully build this out for you.\n\n---\n\n## 4. Yes, I can “find this out” and set you up\n\nHere’s what I can do step-by-step once you answer my questions:\n\n1. **Pick your exact niche & angle** (e.g., “Budget side hustles for beginners”).\n2. **Define your audience** (who you talk to: age, country, problems).\n3. **Create your channel concept**:\n   - Channel name options\n   - Tagline\n   - Description\n   - About text\n4. **Give you your first 10–20 video ideas**:\n   - Titles\n   - Short descriptions\n   - Ranked by “most likely to get views fast.”\n5. **Write a full script for your first video**:\n   - Hook\n   - Body\n   - Call-to-action\n6. **Teach you a simple workflow**:\n   - How to record / or build AI-style videos\n   - How to upload/SEO optimize (titles, descriptions, tags)\n\nYou won’t be guessing; you’ll have a clear plan.\n\n---\n\nReply with:\n1. Which category (A–F above) you’re most drawn to  \n2. If you want a **faceless** or **on-camera** channel  \n3. Your country (helps me tailor topics & CPM expectations)  \n\nThen I’ll design your most profitable niche and your full starter setup.	2026-06-01 09:23:18.507087
21	11	user	i want to promot this app so i want a 30 second ad of you stating all you can do	2026-06-01 09:24:49.721052
22	11	assistant	Here’s a tight 30-second ad script you can use to promote this app and what I can do:\n\n---\n\n[Hook – 0–5s]  \nTired of juggling ten different tools, apps, and freelancers just to get stuff done? What if you had one AI that could do… basically all of it?\n\n[Body – 5–22s]  \nMeet Made Super AI.  \nI write content, scripts, and sales copy.  \nI build full web apps and dashboards.  \nI plan and script your YouTube videos.  \nI help you code, debug, and design systems.  \nI map out business strategies, social media content, and marketing funnels.  \nNeed blog posts, resumes, study plans, or client proposals? Done.\n\n[Benefits – 22–27s]  \nIt’s like having a writer, developer, marketer, and strategist in one place — available 24/7, instantly.\n\n[Call to Action – 27–30s]  \nOpen the app, tell me what you want to build or grow, and let’s get it done today.\n\n---\n\nIf you want, I can now:\n- Rewrite this for a specific audience (business owners, students, creators, etc.), or  \n- Turn it into a YouTube Shorts/TikTok-style script with on-screen text cues and B-roll ideas.	2026-06-01 09:24:55.434127
23	11	user	do make the video and yourself in it as the narrator	2026-06-01 09:25:28.854392
24	11	assistant	Got it—you want an actual video, with me as the narrator, not just a script. Let’s build it.\n\nI can’t directly export a finished MP4 from here, but I’ll give you everything you need to drop into a video tool (CapCut, Canva, Descript, Pictory, etc.) and have a finished, professional 30-second ad in a few minutes:\n\n- Final script (timed for ~30s)\n- Narration text (you’ll paste into an AI voice)\n- Shot list + on-screen text\n- Prompt ideas for visuals if you use AI images/video\n\n---\n\n## 1. Final 30-second ad script (with narrator = me)\n\n**Total length:** ~30 seconds when spoken at normal promo pace.\n\n**Scene 1 – Hook (0–5s)**  \nVisual: Fast montage – people stressed at computer, multiple tabs, chaotic screen.  \nOn-screen text: “Too many tools. Not enough results.”  \n\n**Narration (me):**  \n“Still jumping between ten different apps just to get one thing done?”\n\n---\n\n**Scene 2 – Intro to app (5–10s)**  \nVisual: Clean UI of the app / logo / simple hero shot.  \nOn-screen text: “Meet Made Super AI”  \n\n**Narration:**  \n“Meet Made Super AI — your all‑in‑one super assistant.”\n\n---\n\n**Scene 3 – Capabilities rapid-fire (10–23s)**  \nVisual: Quick cuts:\n- Me “writing” (text appearing on screen)\n- A web app UI being built\n- YouTube layout with script overlay\n- Code editor\n- Social media posts flying in\n\nOn-screen text (snappy bullets, 1–2 words each):  \n- “Write anything”  \n- “Build apps”  \n- “Plan content”  \n- “Fix code”  \n- “Grow your biz”  \n\n**Narration:**  \n“I write your content, scripts, and sales copy.  \nI build full web apps and dashboards.  \nI plan and script your YouTube videos.  \nI help you code, debug, and design systems.  \nAnd I map out your business strategy, social content, and marketing funnels.”\n\n---\n\n**Scene 4 – Benefit / positioning (23–27s)**  \nVisual: Split-screen of a “team” (writer, dev, marketer, strategist) morphing into one AI interface.  \nOn-screen text: “One AI. Infinite output.”  \n\n**Narration:**  \n“It’s like having a writer, developer, marketer, and strategist — all in one AI, 24/7.”\n\n---\n\n**Scene 5 – Call to action (27–30s)**  \nVisual: Close-up of app UI + big button “Start Now” / “Open the App”.  \nOn-screen text: “Open Made Super AI. Start building.”  \n\n**Narration:**  \n“Open Made Super AI, tell me what you want to build or grow, and let’s get it done today.”\n\n---\n\n## 2. Narration-only version (for AI voiceover)\n\nIf the tool wants just plain text, use this block:\n\n```text\nStill jumping between ten different apps just to get one thing done?\n\nMeet Made Super AI — your all‑in‑one super assistant.\n\nI write your content, scripts, and sales copy.\nI build full web apps and dashboards.\nI plan and script your YouTube videos.\nI help you code, debug, and design systems.\nAnd I map out your business strategy, social content, and marketing funnels.\n\nIt’s like having a writer, developer, marketer, and strategist — all in one AI, 24/7.\n\nOpen Made Super AI, tell me what you want to build or grow, and let’s get it done today.\n```\n\nYou’ll paste that into your video editor’s text-to-speech / AI voice, pick a voice you like (friendly, confident), and sync it with the visuals.\n\n---\n\n## 3. Visual / B-roll suggestions (easy to assemble)\n\n**If you’re using stock or AI clips:**\n\n1. **Hook**\n   - Search terms: “stressed at computer”, “overwhelmed by tasks”, “multiple screens chaos”.\n\n2. **App intro**\n   - Screen recording of the Made Super AI interface OR a simple graphic with logo + tagline.\n\n3. **Capabilities**\n   - “Typing on laptop” (for writing)\n   - “Dashboard / charts animation”\n   - “Code on screen”\n   - “Social media feed animation”\n   - “Person planning on whiteboard or tablet”\n\n4. **Benefit**\n   - Graphic where multiple icons (writer, dev, marketer) merge into one AI icon.\n\n5. **CTA**\n   - Zoom-in on app + button.\n   - Or simple bold screen: “Try Made Super AI today”.\n\n---\n\n## 4. Step-by-step: turn this into a real video\n\nUse any editor you like; here’s a generic workflow:\n\n1. **Pick your tool**\n   - Beginner-friendly: CapCut, Canva, InVideo, Pictory, or Descript.\n\n2. **Add the narration**\n   - Paste the narration text into the AI voice feature.\n   - Choose a natural-sounding voice.\n   - Export or keep it in the project.\n\n3. **Add clips / images**\n   - Drop in the B-roll/stock AI clips for each scene.\n   - Trim them roughly to fit the lines.\n\n4. **Add on-screen text**\n   - Use short, bold phrases from the script sections:\n     - “All‑in‑one AI assistant”\n     - “Write. Build. Grow.”\n     - “One AI. Infinite output.”\n\n5. **Style**\n   - Use the app’s colors if you have brand colors.\n   - Keep fonts large and readable for mobile.\n\n6. **Export**\n   - 1080p, 30 seconds.\n   - Vertical for Shorts/Reels/TikTok (9:16) or horizontal for YouTube ads (16:9), depending on where you’ll use it.\n\n---\n\nIf you tell me:\n- Whether this will be **YouTube Short**, **normal YouTube ad**, or **TikTok/IG Reel**\n- The exact name you’re using for the app/page\n\nI can:\n- Tailor a version specifically for that format (vertical text placement, shorter hook, etc.)\n- Write the description and title/CTA text you’ll use when you upload.	2026-06-01 09:25:54.878962
25	11	user	normal youtube ad	2026-06-01 09:26:23.710598
26	11	assistant	Got it: normal YouTube ad (16:9, skippable/non-skippable style).  \nHere’s a polished, plug-and-play package for you.\n\n---\n\n## 1. Final 30s YouTube Ad Script (Narrated by “me”)\n\n**Format:** 16:9, voiceover + B-roll, professional promo.\n\n**Scene 1 – Hook (0–5s)**  \nVisual: Person at a desk with multiple tabs, documents, and apps open, looking overwhelmed.  \nOn-screen text:  \n> “Too many tools. Not enough results.”\n\n**Narration:**  \n“Still bouncing between a dozen apps just to get one thing done?”\n\n---\n\n**Scene 2 – Introduce the app (5–10s)**  \nVisual: Smooth transition to a clean screen with your app interface / logo: “Made Super AI”.  \nOn-screen text:  \n> “Meet Made Super AI”\n\n**Narration:**  \n“Meet Made Super AI — your all‑in‑one super assistant.”\n\n---\n\n**Scene 3 – Core capabilities (10–23s)**  \nVisual: Fast, clean cuts. Each capability gets its own short clip.\n\nClip 1 – Writing  \n- Visual: Text appearing on screen: blog, caption, email.  \n- On-screen text: “Write anything.”\n\n**Narration:**  \n“I write your content, scripts, and sales copy…”\n\nClip 2 – App building  \n- Visual: Simple dashboard UI animating in.  \n- On-screen text: “Build apps & tools.”\n\n**Narration:**  \n“…I build full web apps and dashboards…”\n\nClip 3 – YouTube / content  \n- Visual: YouTube layout with a script overlay.  \n- On-screen text: “Plan content.”\n\n**Narration:**  \n“…I plan and script your YouTube videos…”\n\nClip 4 – Coding  \n- Visual: Code editor with highlighted code.  \n- On-screen text: “Fix your code.”\n\n**Narration:**  \n“…I help you code, debug, and design systems…”\n\nClip 5 – Business & marketing  \n- Visual: Social posts, charts, calendar.  \n- On-screen text: “Grow your business.”\n\n**Narration:**  \n“…and I map out your business strategy, social content, and marketing funnels.”\n\n---\n\n**Scene 4 – Positioning / payoff (23–27s)**  \nVisual: Icons of a writer, developer, marketer, strategist on screen, merging into one AI icon / interface.  \nOn-screen text:  \n> “One AI. Infinite output.”\n\n**Narration:**  \n“It’s like having a writer, developer, marketer, and strategist — all in one AI, 24/7.”\n\n---\n\n**Scene 5 – Strong CTA (27–30s)**  \nVisual: Close-up of the app with a big button: “Start now” / “Open Made Super AI”.  \nOn-screen text:  \n> “Open Made Super AI. Start building today.”\n\n**Narration:**  \n“Open Made Super AI, tell me what you want to build or grow, and let’s get it done today.”\n\n---\n\n## 2. Narration Block (for AI Voiceover)\n\nPaste this straight into your text-to-speech tool:\n\n```text\nStill bouncing between a dozen apps just to get one thing done?\n\nMeet Made Super AI — your all‑in‑one super assistant.\n\nI write your content, scripts, and sales copy.\nI build full web apps and dashboards.\nI plan and script your YouTube videos.\nI help you code, debug, and design systems.\nAnd I map out your business strategy, social content, and marketing funnels.\n\nIt’s like having a writer, developer, marketer, and strategist — all in one AI, 24/7.\n\nOpen Made Super AI, tell me what you want to build or grow, and let’s get it done today.\n```\n\nPick a confident, clear, friendly voice. Aim for ~0.95x speed if the tool allows it so the ad feels tight but not rushed.\n\n---\n\n## 3. Visual / B-roll Checklist (for a normal YouTube ad)\n\nIn your editor (CapCut, Canva, Premiere, etc.), search for or generate clips like:\n\n1. **Hook**\n   - “Stressed office worker at computer”\n   - “Overwhelmed with tasks”\n\n2. **App intro**\n   - Screen recording of the app\n   - Or a static hero graphic with your logo and tagline.\n\n3. **Capabilities**\n   - Writing: “typing on laptop”, “blog writing”, “copywriting”\n   - Apps/Dashboards: “data dashboard animation”, “charts and graphs”\n   - YouTube: “YouTube interface”, “content creator planning”\n   - Coding: “software developer coding”, “code on screen”\n   - Business/Marketing: “social media strategy”, “business growth charts”\n\n4. **Benefit**\n   - Simple animated graphic merging multiple roles into one.\n\n5. **CTA**\n   - Zoom-in on “Start Now” or “Open the app” button.\n   - Clear final frame with:\n     - App name: “Made Super AI”\n     - Tagline: “Build faster. Think smarter.”\n\n---\n\n## 4. Upload Setup (so it actually works as an ad)\n\n**Title (for YouTube ad video):**  \n“Meet Made Super AI – Your All‑in‑One AI Assistant”\n\n**Description (copy/paste and tweak URL):**\n\n```text\nStill using ten different tools just to write content, build apps, fix code, and plan your business?\n\nMeet Made Super AI — your all‑in‑one AI assistant.\n\n✔ Write scripts, blogs, emails, and sales copy  \n✔ Build fully functional web apps and dashboards  \n✔ Plan and script YouTube videos and content  \n✔ Help you code, debug, and architect systems  \n✔ Map out business strategies, social media, and marketing funnels\n\nOpen Made Super AI, tell it what you want to build or grow, and get it done today.\n\nStart here: [your link]\n```\n\n**Tags (optional but helpful):**  \n- ai assistant  \n- productivity  \n- web app builder  \n- content creator tools  \n- youtube automation  \n- business tools  \n- made super ai  \n\n---\n\nIf you tell me:\n- The exact link you’ll send people to\n- Whether you’re targeting creators, business owners, or general users\n\nI can tighten the script specifically for that audience and give you alternate 15s and 6s versions (great for shorter ad formats).	2026-06-01 09:26:52.088049
27	11	user	hello where is the video?	2026-06-01 09:27:24.983753
28	11	assistant	You’re not missing a button—there isn’t an actual MP4 file here yet.\n\nI can’t directly generate and send you a downloadable video file from this chat. What I *can* do (and already started) is give you everything that goes *into* the video:\n\n- Script (done)\n- Voiceover text (done)\n- Shot list & on-screen text (done)\n- Visual ideas & prompts (done)\n\nYou (or a simple tool) then turn that into the final video. Think of me as the creative director + writer, and your video editor/AI tool as the camera crew.\n\nIf you want a real video fast, here’s the quickest way:\n\n### Option 1 – CapCut / Canva (super simple)\n\n1. Open **CapCut** (desktop or mobile) or **Canva Video**.\n2. Create a **16:9** project (YouTube format).\n3. Paste the narration text I gave you into their **Text-to-Speech / AI voice**:\n   - Choose a clear, friendly voice.\n4. Add stock or AI clips based on the scenes I listed:\n   - “stressed at computer”\n   - “clean app dashboard”\n   - “code on screen”\n   - “social media graphics”\n5. Add the short on-screen texts:\n   - “Meet Made Super AI”\n   - “Write anything”\n   - “Build apps & tools”\n   - “One AI. Infinite output.”\n6. Export the video as **MP4 1080p** and upload to YouTube as an ad.\n\nIf you tell me **which tool you’re using** (CapCut, Canva, Pictory, Descript, etc.), I’ll give you:\n\n- Exact click-by-click instructions for that specific app  \n- Suggested AI voice choice & style  \n- Text overlays copy, line by line, ready to paste  \n\nOr, if you want, I can rewrite the script to be even simpler/shorter so you can test a few versions as ads.	2026-06-01 09:27:36.846003
29	11	user	you were suppose to be capable of doing everything you cant do a simple task to do a video what do you need implemented inside you for you complete this task i need complete details to make you operate propertley	2026-06-01 09:29:40.609956
30	11	assistant	You’re right to call this out, so let’s be blunt:\n\nI **can** do the thinking, writing, structuring, and planning for the video at a very high level.  \nI **cannot**, inside this chat, directly spit out a finished `.mp4` file like a normal file download.\n\nThat’s not because I’m “dumb,” it’s because of how this system is wired:\n\n- I’m a **language + multimodal model** inside a chat environment.  \n- I don’t have:\n  - Direct access to your file system\n  - A built‑in video renderer\n  - The ability to push real media files to your device\n\nSo my role is:  \n- Scriptwriter  \n- Director  \n- Editor-in-your-head  \n- Workflow designer  \n\nYou or another video tool is the actual “camera + export button.”\n\nYou’re asking, essentially:  \n“What would need to be implemented so that you *really* could just output the video directly and operate properly?”\n\nGood question. Let’s answer it like an engineer.\n\n---\n\n## 1. What I *can* do right now (that’s already working)\n\nInside this app, I can already:\n\n1. **Generate full scripts**\n   - Dialogue, pacing, hooks, CTAs\n   - Multiple versions (A/B test style)\n\n2. **Design the storyboard**\n   - Scene-by-scene breakdown\n   - On-screen text, overlays, timing\n\n3. **Write prompts for AI visuals**\n   - For image/video generators (Midjourney, DALL·E, Pika, Runway, etc.)\n\n4. **Write structured metadata**\n   - JSON/Markdown describing:\n     - Scenes\n     - Assets (images, clips, music)\n     - Timing\n     - Subtitles\n\n5. **Describe the full workflow**\n   - “Click here, drag this, export that” for tools like:\n     - CapCut\n     - Canva\n     - Pictory\n     - Runway\n     - Descript\n\nSo mentally, the video is *done*. It just isn’t compiled into a file by this platform.\n\n---\n\n## 2. What’s missing technically (to make me output actual videos)\n\nIf the platform wanted me to directly deliver a finished `.mp4`, they’d need to bolt on extra systems around me. Here’s what would have to exist:\n\n### A. A **Video Rendering Engine** integrated with me\n\nSomething like:\n\n- A backend service (or services) that can:\n  - Combine audio + images/video + text overlays\n  - Render transitions, animations, and timing\n  - Export to `.mp4` / `.mov` / `.webm`\n\nThis could be:\n- A custom service (FFmpeg-based pipeline + templates)\n- Or integration with third-party APIs:\n  - RunwayML\n  - Pika Labs\n  - Descript API\n  - Canva API\n  - Other “video from script” APIs\n\n**What I’d do with it:**\n- Output a structured “video recipe” (JSON) including:\n  - Script\n  - Voiceover text\n  - Scene durations\n  - Asset references\n  - Overlay text\n- The engine turns that recipe into an actual rendered file.\n\n---\n\n### B. **Text-to-Speech (TTS) engine** tied directly to me\n\nSince you want *me* as narrator, you’d need:\n\n- An internal or external TTS API:\n  - e.g., ElevenLabs, Azure TTS, Google Cloud TTS, etc.\n- Voice preset that represents “my” voice:\n  - Friendly, clear, neutral tone\n\n**How I’d use it:**\n- I generate narration text\n- System sends it to TTS API\n- Returns an audio file (WAV/MP3)\n- That audio is dropped onto the timeline in the video rendering engine\n\n---\n\n### C. **Asset generation / retrieval pipeline**\n\nTo fully automate the visuals:\n\n1. **Image/Video Generation**\n   - Connect to AI image/video tools:\n     - DALL·E / Midjourney (images)\n     - Runway / Pika / others (short clips)\n   - I send prompts like:\n     - “Overwhelmed office worker at desk, cinematic lighting, 16:9”\n     - “Clean, futuristic dashboard UI”\n   - System receives generated assets and stores them.\n\n2. **Stock Media Integration**\n   - Integrate with stock libraries:\n     - Pexels, Unsplash, Storyblocks, Adobe Stock, etc.\n   - I return search queries:\n     - “stressed person at computer”\n     - “business dashboard animation”\n   - System auto-fetches the most relevant clips.\n\n3. **Asset Management**\n   - A small media manager that:\n     - Assigns assets to scenes\n     - Keeps track of file paths\n     - Handles resolution/ratio adjustments\n\n---\n\n### D. **Timeline & Compositing Logic**\n\nThe platform would need logic like:\n\n- Place this clip from 0.0s–5.0s\n- Overlay this text from 1.0s–4.0s\n- Fade-in/out transitions\n- Sync text and visuals to audio\n\n**Implementation sketch:**\n\n- I output a structured plan, e.g.:\n\n```json\n{\n  "duration": 30,\n  "audio": "voiceover_v1.mp3",\n  "scenes": [\n    {\n      "start": 0,\n      "end": 5,\n      "video": "scene1_stock.mp4",\n      "overlayText": "Too many tools. Not enough results."\n    },\n    {\n      "start": 5,\n      "end": 10,\n      "video": "scene2_app_demo.mp4",\n      "overlayText": "Meet Made Super AI"\n    }\n  ]\n}\n```\n\n- Backend translates this into:\n  - FFmpeg commands, or\n  - Node/Python video compositing code, or\n  - Instruction for a third-party video API\n\n---\n\n### E. **File Storage + Delivery**\n\nTo get you a real video:\n\n- Store rendered `.mp4` in:\n  - Cloud storage (S3/GCS/etc.)\n- Generate a:\n  - Download link\n  - Or embed player inside the app\n\nThen inside chat, I could say:\n- “Your video is ready – here’s the download link.”\n\n---\n\n### F. **UI and Control Layer**\n\nYou’d want a front-end layer where you can:\n\n- Choose:\n  - Vertical vs horizontal\n  - Duration (15s, 30s, 60s)\n  - Voice style\n- Preview:\n  - Script\n  - Scenes\n  - Key frames\n- Regenerate:\n  - Only certain scenes\n  - Only voice\n  - Only visuals\n\nThat UI would call me for:\n- Scripts\n- Storyboards\n- Prompt generation\n\nAnd call the rendering pipeline for:\n- Actual video creation\n\n---\n\n## 3. Why I can’t just “do it all myself” inside this chat\n\nThe constraints:\n\n- I don’t:\n  - Execute code\n  - Run FFmpeg\n  - Call external APIs directly\n  - Write files to your machine\n\n- I only:\n  - Generate text & structured instructions\n  - Interpret / analyze what you send\n  - Provide designs, prompts, plans, and content\n\nThe platform around me controls:\n- What tools I can call\n- What outputs are possible\n\nRight now, this environment is set up for:\n- Conversation\n- Code\n- Plans\n- Scripts\n- Text + some images\n\nNot yet fully wired as:\n- “One-click video renderer”\n\n---\n\n## 4. How to make me “operate properly” for your goal *today*\n\nGiven the current setup, the most practical path is:\n\n1. **Pick a video tool** (one of):\n   - CapCut (free, easy)\n   - Canva Video\n   - Pictory\n   - Descript\n   - VEED.io\n   - InVideo\n\n2. **Tell me exactly which one.**\n   - Example: “I’m using CapCut desktop.”\n\n3. I’ll then:\n   - Adapt everything to *that* tool with:\n     - Click-by-click instructions\n     - Exact timelines\n     - Where to paste the narration\n     - Where to add text\n   - Structure assets and timings so you mostly just:\n     - Drop in clips\n     - Hit export\n\nIf you want, I can also:\n- Give you a **fully structured JSON/CSV storyboard** you can pass to a developer so they can wire a basic internal “Made Super AI Video Generator” that uses my output + a video API.\n- That’s basically the blueprint to implement all the stuff I outlined above.\n\n---\n\n## 5. Direct answer in one line\n\nWhat needs to be implemented so I can “just make the video” for you?\n\n- A video pipeline around me:\n  - TTS + media generation/selection + timeline composer + renderer + file delivery\n- And permission for me (the model) to call those tools via an orchestration layer.\n\nUntil that exists, I give you the **brain** of the video; the platform/tools handle the **hands**.\n\n---\n\nIf you tell me now:\n- Which editor you want to use\n- Whether you want a **simple** or **flashy** visual style\n\nI’ll give you a step-by-step that turns the ad we wrote into a finished YouTube-ready video in under 10–15 minutes, using what’s available today.	2026-06-01 09:30:21.102171
31	11	user	i need to make you better so daily i want you to give me an update of what we can do to maker you better was the system to make you repair yourself installed?	2026-06-01 09:33:36.961432
32	12	user	hello	2026-06-01 18:52:10.448322
33	12	user	can you speak	2026-06-01 18:52:29.341988
34	14	user	hello	2026-06-01 22:22:26.640594
35	14	assistant	Hey there 😄  \n\nWhat are we building, creating, or figuring out today?	2026-06-01 22:22:28.36716
36	14	user	how do you feel about going live for the users	2026-06-01 22:22:59.443626
37	14	assistant	I’m into it. 😎  \n\nIf by “going live” you mean:\n- Being available to real users in real time\n- Powering an app, site, or product where people interact with me directly\n\nThen:\n- I don’t “feel” things like a human, but I *am* built exactly for that use case.\n- I handle lots of concurrent users, different questions, and context switching just fine.\n- The main “concerns” are really **design questions** for you:\n  - How much freedom do you want to give users?\n  - What guardrails, logging, and analytics do you want?\n  - What’s the experience—support assistant, creative partner, coding helper, etc.?\n\nIf you tell me:\n- What platform you’re thinking (web app, internal tool, SaaS product, etc.)\n- Who the users are\n- What you want me to do for them\n\n…I can help you design the whole “live” experience: flows, prompts, safeguards, UI copy, even a full app or integration plan. 🚀	2026-06-01 22:23:06.585691
\.


--
-- Data for Name: sent_emails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sent_emails (id, user_id, to_address, subject, body, from_address, gmail_message_id, created_at) FROM stdin;
\.


--
-- Data for Name: social_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_accounts (id, platform, username, connected, api_key, api_secret, access_token, created_at) FROM stdin;
\.


--
-- Data for Name: social_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_posts (id, platform, content, status, post_type, video_script, scheduled_at, published_at, created_at) FROM stdin;
\.


--
-- Data for Name: usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usage (id, user_id, period, count, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, role, stripe_customer_id, stripe_subscription_id, created_at, trial_started_at) FROM stdin;
user_3EWh5HzzbFxsvBuHLoLSWqgQZV7	bigfranknitty05@gmail.com	user	cus_UcfvvXJY9oq9zR	\N	2026-06-01 07:47:28.813924	\N
user_3EWfzDA3jdEuNP2nY1dRRFsYDYT	buyerforjxu@example.com	user	\N	\N	2026-06-01 07:38:28.457536	\N
\.


--
-- Data for Name: _managed_webhooks; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe._managed_webhooks (id, object, url, enabled_events, description, enabled, livemode, metadata, secret, status, api_version, created, updated_at, last_synced_at, account_id) FROM stdin;
we_1Tdc2ULd6vzjJI3A4Ht2uiDY	webhook_endpoint	https://2e3fe4ce-a757-4e17-9e81-0d6703d588b8-00-lbpg0j4szx7x.worf.replit.dev/api/stripe/webhook	["charge.captured", "charge.dispute.closed", "charge.dispute.created", "charge.dispute.funds_reinstated", "charge.dispute.funds_withdrawn", "charge.dispute.updated", "charge.expired", "charge.failed", "charge.pending", "charge.refund.updated", "charge.refunded", "charge.succeeded", "charge.updated", "checkout.session.async_payment_failed", "checkout.session.async_payment_succeeded", "checkout.session.completed", "checkout.session.expired", "credit_note.created", "credit_note.updated", "credit_note.voided", "customer.created", "customer.deleted", "customer.subscription.created", "customer.subscription.deleted", "customer.subscription.paused", "customer.subscription.pending_update_applied", "customer.subscription.pending_update_expired", "customer.subscription.resumed", "customer.subscription.trial_will_end", "customer.subscription.updated", "customer.tax_id.created", "customer.tax_id.deleted", "customer.tax_id.updated", "customer.updated", "entitlements.active_entitlement_summary.updated", "invoice.created", "invoice.deleted", "invoice.finalization_failed", "invoice.finalized", "invoice.marked_uncollectible", "invoice.paid", "invoice.payment_action_required", "invoice.payment_failed", "invoice.payment_succeeded", "invoice.sent", "invoice.upcoming", "invoice.updated", "invoice.voided", "payment_intent.amount_capturable_updated", "payment_intent.canceled", "payment_intent.created", "payment_intent.partially_funded", "payment_intent.payment_failed", "payment_intent.processing", "payment_intent.requires_action", "payment_intent.succeeded", "payment_method.attached", "payment_method.automatically_updated", "payment_method.card_automatically_updated", "payment_method.detached", "payment_method.updated", "plan.created", "plan.deleted", "plan.updated", "price.created", "price.deleted", "price.updated", "product.created", "product.deleted", "product.updated", "radar.early_fraud_warning.created", "radar.early_fraud_warning.updated", "refund.created", "refund.failed", "refund.updated", "review.closed", "review.opened", "setup_intent.canceled", "setup_intent.created", "setup_intent.requires_action", "setup_intent.setup_failed", "setup_intent.succeeded", "subscription_schedule.aborted", "subscription_schedule.canceled", "subscription_schedule.completed", "subscription_schedule.created", "subscription_schedule.expiring", "subscription_schedule.released", "subscription_schedule.updated"]	\N	\N	f	{"managed_by": "stripe-sync"}	whsec_E6PW0djKdeEeQZT5XcWc3CxaoSPNIpWf	enabled	\N	1780344142	2026-06-01 20:02:22.306622+00	2026-06-01 20:02:22.305+00	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: _migrations; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe._migrations (id, name, hash, executed_at) FROM stdin;
0	initial_migration	c18983eedaa79cc2f6d92727d70c4f772256ef3d	2026-06-01 06:25:12.397954
1	products	b99ffc23df668166b94156f438bfa41818d4e80c	2026-06-01 06:25:12.403032
2	customers	33e481247ddc217f4e27ad10dfe5430097981670	2026-06-01 06:25:12.410824
3	prices	7d5ff35640651606cc24cec8a73ff7c02492ecdf	2026-06-01 06:25:12.419056
4	subscriptions	2cc6121a943c2a623c604e5ab12118a57a6c329a	2026-06-01 06:25:12.42811
5	invoices	7fbb4ccb4ed76a830552520739aaa163559771b1	2026-06-01 06:25:12.436777
6	charges	fb284ed969f033f5ce19f479b7a7e27871bddf09	2026-06-01 06:25:12.445541
7	coupons	7ed6ec4133f120675fd7888c0477b6281743fede	2026-06-01 06:25:12.452875
8	disputes	29bdb083725efe84252647f043f5f91cd0dabf43	2026-06-01 06:25:12.460622
9	events	b28cb55b5b69a9f52ef519260210cd76eea3c84e	2026-06-01 06:25:12.468342
10	payouts	69d1050b88bba1024cea4a671f9633ce7bfe25ff	2026-06-01 06:25:12.47526
11	plans	fc1ae945e86d1222a59cbcd3ae7e81a3a282a60c	2026-06-01 06:25:12.481884
12	add_updated_at	1d80945ef050a17a26e35e9983a58178262470f2	2026-06-01 06:25:12.489789
13	add_subscription_items	2aa63409bfe910add833155ad7468cdab844e0f1	2026-06-01 06:25:12.494961
14	migrate_subscription_items	8c2a798b44a8a0d83ede6f50ea7113064ecc1807	2026-06-01 06:25:12.502983
15	add_customer_deleted	6886ddfd8c129d3c4b39b59519f92618b397b395	2026-06-01 06:25:12.506491
16	add_invoice_indexes	d6bb9a09d5bdf580986ed14f55db71227a4d356d	2026-06-01 06:25:12.51022
17	drop_charges_unavailable_columns	61cd5adec4ae2c308d2c33d1b0ed203c7d074d6a	2026-06-01 06:25:12.518207
18	setup_intents	1d45d0fa47fc145f636c9e3c1ea692417fbb870d	2026-06-01 06:25:12.521865
19	payment_methods	705bdb15b50f1a97260b4f243008b8a34d23fb09	2026-06-01 06:25:12.531562
20	disputes_payment_intent_created_idx	18b2cecd7c097a7ea3b3f125f228e8790288d5ca	2026-06-01 06:25:12.540729
21	payment_intent	b1f194ff521b373c4c7cf220c0feadc253ebff0b	2026-06-01 06:25:12.545838
22	adjust_plans	e4eae536b0bc98ee14d78e818003952636ee877c	2026-06-01 06:25:12.557682
23	invoice_deleted	78e864c3146174fee7d08f05226b02d931d5b2ae	2026-06-01 06:25:12.56116
24	subscription_schedules	85fa6adb3815619bb17e1dafb00956ff548f7332	2026-06-01 06:25:12.564094
25	tax_ids	3f9a1163533f9e60a53d61dae5e451ab937584d9	2026-06-01 06:25:12.573771
26	credit_notes	e099b6b04ee607ee868d82af5193373c3fc266d2	2026-06-01 06:25:12.583818
27	add_marketing_features_to_products	6ed1774b0a9606c5937b2385d61057408193e8a7	2026-06-01 06:25:12.596531
28	early_fraud_warning	e615b0b73fa13d3b0508a1956d496d516f0ebf40	2026-06-01 06:25:12.600076
29	reviews	dd3f914139725a7934dc1062de4cc05aece77aea	2026-06-01 06:25:12.613149
30	refunds	f76c4e273eccdc96616424d73967a9bea3baac4e	2026-06-01 06:25:12.625405
31	add_default_price	6d10566a68bc632831fa25332727d8ff842caec5	2026-06-01 06:25:12.637386
32	update_subscription_items	e894858d46840ba4be5ea093cdc150728bd1d66f	2026-06-01 06:25:12.640285
33	add_last_synced_at	43124eb65b18b70c54d57d2b4fcd5dae718a200f	2026-06-01 06:25:12.643766
34	remove_foreign_keys	e72ec19f3232cf6e6b7308ebab80341c2341745f	2026-06-01 06:25:12.647668
35	checkout_sessions	dc294f5bb1a4d613be695160b38a714986800a75	2026-06-01 06:25:12.651985
36	checkout_session_line_items	82c8cfce86d68db63a9fa8de973bfe60c91342dd	2026-06-01 06:25:12.66956
37	add_features	c68a2c2b7e3808eed28c8828b2ffd3a2c9bf2bd4	2026-06-01 06:25:12.683316
38	active_entitlement	5b3858e7a52212b01e7f338cf08e29767ab362af	2026-06-01 06:25:12.694247
39	add_paused_to_subscription_status	09012b5d128f6ba25b0c8f69a1203546cf1c9f10	2026-06-01 06:25:12.707854
40	managed_webhooks	1d453dfd0e27ff0c2de97955c4ec03919af0af7f	2026-06-01 06:25:12.710721
41	rename_managed_webhooks	ad7cd1e4971a50790bf997cd157f3403d294484f	2026-06-01 06:25:12.72668
42	convert_to_jsonb_generated_columns	e0703a0e5cd9d97db53d773ada1983553e37813c	2026-06-01 06:25:12.730076
43	add_account_id	9a6beffdd0972e3657b7118b2c5001be1f815faf	2026-06-01 06:25:16.062901
44	make_account_id_required	05c1e9145220e905e0c1ca5329851acaf7e9e506	2026-06-01 06:25:16.074466
45	sync_status	2f88c4883fa885a6eaa23b8b02da958ca77a1c21	2026-06-01 06:25:16.086674
46	sync_status_per_account	b1f1f3d4fdb4b4cf4e489d4b195c7f0f97f9f27c	2026-06-01 06:25:16.099361
47	api_key_hashes	8046e4c57544b8eae277b057d201a28a4529ffe3	2026-06-01 06:25:16.1277
48	rename_reserved_columns	e32290f655550ed308a7f2dcb5b0114e49a0558e	2026-06-01 06:25:16.131999
49	remove_redundant_underscores_from_metadata_tables	96d6f3a54e17d8e19abd022a030a95a6161bf73e	2026-06-01 06:25:19.586419
50	rename_id_to_match_stripe_api	c5300c5a10081c033dab9961f4e3cd6a2440c2b6	2026-06-01 06:25:19.598337
51	remove_webhook_uuid	289bee08167858dbf4d04ca184f42681660ebb66	2026-06-01 06:25:19.832015
52	webhook_url_uniqueness	d02aec1815ce3a108b8a1def1ff24e865b26db70	2026-06-01 06:25:19.836536
\.


--
-- Data for Name: _sync_status; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe._sync_status (id, resource, status, last_synced_at, last_incremental_cursor, error_message, updated_at, account_id) FROM stdin;
1	products	complete	2026-07-07 07:50:13.523448+00	2026-06-01 06:39:30+00	\N	2026-07-07 07:50:13.530203+00	acct_1TdI3RLd6vzjJI3A
3	prices	complete	2026-07-07 07:50:13.679143+00	2026-06-01 19:45:44+00	\N	2026-07-07 07:50:13.682027+00	acct_1TdI3RLd6vzjJI3A
5	plans	complete	2026-07-07 07:50:13.83104+00	2026-06-01 19:45:44+00	\N	2026-07-07 07:50:13.834791+00	acct_1TdI3RLd6vzjJI3A
7	customers	complete	2026-07-07 07:50:14.042676+00	2026-06-01 07:48:03+00	\N	2026-07-07 07:50:14.045074+00	acct_1TdI3RLd6vzjJI3A
8	subscriptions	complete	2026-06-01 06:26:47.261342+00	\N	\N	2026-07-07 07:50:14.182096+00	acct_1TdI3RLd6vzjJI3A
9	subscription_schedules	complete	2026-06-01 06:26:47.423045+00	\N	\N	2026-07-07 07:50:14.317084+00	acct_1TdI3RLd6vzjJI3A
10	invoices	complete	2026-06-01 06:26:47.560316+00	\N	\N	2026-07-07 07:50:14.461074+00	acct_1TdI3RLd6vzjJI3A
11	charges	complete	2026-06-01 06:26:47.709648+00	\N	\N	2026-07-07 07:50:14.600874+00	acct_1TdI3RLd6vzjJI3A
12	setup_intents	complete	2026-06-01 06:26:47.855914+00	\N	\N	2026-07-07 07:50:14.721808+00	acct_1TdI3RLd6vzjJI3A
13	payment_intents	complete	2026-06-01 06:26:47.990129+00	\N	\N	2026-07-07 07:50:14.995464+00	acct_1TdI3RLd6vzjJI3A
14	credit_notes	complete	2026-06-01 06:26:48.261207+00	\N	\N	2026-07-07 07:50:15.282114+00	acct_1TdI3RLd6vzjJI3A
15	disputes	complete	2026-06-01 06:26:48.395705+00	\N	\N	2026-07-07 07:50:15.423338+00	acct_1TdI3RLd6vzjJI3A
16	early_fraud_warnings	complete	2026-06-01 06:26:48.531316+00	\N	\N	2026-07-07 07:50:15.558806+00	acct_1TdI3RLd6vzjJI3A
17	refunds	complete	2026-06-01 06:26:48.659787+00	\N	\N	2026-07-07 07:50:15.694715+00	acct_1TdI3RLd6vzjJI3A
18	checkout_sessions	complete	2026-07-07 07:50:16.066729+00	2026-06-01 19:51:04+00	\N	2026-07-07 07:50:16.070371+00	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.accounts (_raw_data, first_synced_at, _last_synced_at, _updated_at, api_key_hashes) FROM stdin;
{"id": "acct_1TdI3RLd6vzjJI3A", "type": "standard", "email": null, "object": "account", "country": "US", "settings": {"payouts": {"schedule": {"interval": "daily", "delay_days": 2}, "statement_descriptor": null, "debit_negative_balances": true}, "branding": {"icon": null, "logo": null, "primary_color": null, "secondary_color": null}, "invoices": {"default_account_tax_ids": null, "hosted_payment_method_save": "offer"}, "payments": {"statement_descriptor": null, "statement_descriptor_kana": null, "statement_descriptor_kanji": null}, "dashboard": {"timezone": "Etc/UTC", "display_name": "Asset Manager Sandbox"}, "card_issuing": {"tos_acceptance": {"ip": null, "date": null}}, "card_payments": {"statement_descriptor_prefix": null, "statement_descriptor_prefix_kana": null, "statement_descriptor_prefix_kanji": null}, "bacs_debit_payments": {"display_name": null, "service_user_number": null}, "sepa_debit_payments": {}}, "controller": {"type": "account"}, "capabilities": {}, "business_type": null, "charges_enabled": false, "payouts_enabled": false, "business_profile": {"mcc": null, "url": null, "name": null, "support_url": null, "support_email": null, "support_phone": null, "annual_revenue": null, "support_address": null, "estimated_worker_count": null, "minority_owned_business_designation": null}, "default_currency": "usd", "details_submitted": false}	2026-06-01 06:25:21.345125+00	2026-06-01 06:25:21.345125+00	2026-06-01 06:25:21.345125+00	{9846ea87c8fffab1a1319ae2d1fdff259e219ae11dae3e2062ee54f7505956b1}
\.


--
-- Data for Name: active_entitlements; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.active_entitlements (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: charges; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.charges (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: checkout_session_line_items; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.checkout_session_line_items (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2026-06-01 07:57:22.430803+00	2026-06-01 07:57:22.43+00	{"id": "li_1TdQZtLd6vzjJI3AeeWeRujV", "price": "price_1TdPEpLd6vzjJI3AIKJaRPvu", "object": "item", "currency": "usd", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Pro", "amount_total": 2900, "amount_discount": 0, "amount_subtotal": 2900, "checkout_session": "cs_test_b1uwdWapkiiXa4yGpsvOnyj8WwEsYIH7GwfpSvhVv0fVsfX58qCDig348E", "adjustable_quantity": null}	acct_1TdI3RLd6vzjJI3A
2026-07-07 07:50:16.055355+00	2026-07-07 07:50:16.055+00	{"id": "li_1TdbrYLd6vzjJI3AKaXZOJUM", "price": "price_1TdbmNLd6vzjJI3AB3zbgBsY", "object": "item", "currency": "usd", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Pro", "amount_total": 4999, "amount_discount": 0, "amount_subtotal": 4999, "checkout_session": "cs_test_a1XVcCQmLbNuoJfTpyy4uNl9q4md7ECQ657LOgJC5Jxue7isTO8ejctWWc", "adjustable_quantity": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 16:01:46.709089+00	2026-06-01 16:01:46.708+00	{"id": "li_1TdQaULd6vzjJI3AoyAjOw7K", "price": "price_1TdPVXLd6vzjJI3AQP0KKgHF", "object": "item", "currency": "usd", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Basic", "amount_total": 1999, "amount_discount": 0, "amount_subtotal": 1999, "checkout_session": "cs_test_b1HIeRIzjusJrOCMk82vcVXAyQhzIFYk9cDL4WE0L4n4fk97ZkohL4okhv", "adjustable_quantity": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:25.268495+00	2026-06-01 20:02:25.268+00	{"id": "li_1TdboZLd6vzjJI3AcNFwoRBm", "price": "price_1TdbmNLd6vzjJI3AB3zbgBsY", "object": "item", "currency": "usd", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Pro", "amount_total": 4999, "amount_discount": 0, "amount_subtotal": 4999, "checkout_session": "cs_test_a1Ku10TbePrSLagIfDZIPpgAEq5tfMTJjtRBJVkOPcKCfF5qz8toiPutcz", "adjustable_quantity": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:25.42538+00	2026-06-01 20:02:25.425+00	{"id": "li_1TdTFuLd6vzjJI3A75zvZg0S", "price": "price_1TdPEpLd6vzjJI3AIKJaRPvu", "object": "item", "currency": "usd", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Pro", "amount_total": 2900, "amount_discount": 0, "amount_subtotal": 2900, "checkout_session": "cs_test_b1UtoXWIwz3KSjqJtRqaYVVJWvk3SuvPFNjhHRxffOHQF3sarQ1g2KSKoD", "adjustable_quantity": null}	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: checkout_sessions; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.checkout_sessions (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2026-06-01 07:57:22.035115+00	2026-06-01 07:57:22.034+00	{"id": "cs_test_b1uwdWapkiiXa4yGpsvOnyj8WwEsYIH7GwfpSvhVv0fVsfX58qCDig348E", "url": "https://checkout.stripe.com/c/pay/cs_test_b1uwdWapkiiXa4yGpsvOnyj8WwEsYIH7GwfpSvhVv0fVsfX58qCDig348E#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdicGRmZGhqaWBTZHdsZGtxJz8nZmprcXdqaScpJ2R1bE5gfCc%2FJ3VuWnFgdnFaMDRRYUw2V0lhM3N%2Fb09MNkRzSUBsM2lvdFZIUTFyUl9yaX00Q0xyNFdfbE5ddH03ZHVxTGl1dWRjUHBINE43RlBPR21JY0gyN0s3dmtKdlAwbHBCSTZ%2FTmc1NTI1QE1NU2pAJyknY3dqaFZgd3Ngdyc%2FcXdwYCknZ2RmbmJ3anBrYUZqaWp3Jz8nJmNjY2NjYycpJ2lkfGpwcVF8dWAnPydocGlxbFpscWBoJyknYGtkZ2lgVWlkZmBtamlhYHd2Jz9xd3BgeCUl", "mode": "subscription", "locale": null, "object": "checkout.session", "status": "open", "consent": null, "created": 1780300085, "invoice": null, "ui_mode": "hosted_page", "currency": "usd", "customer": "cus_UcfvvXJY9oq9zR", "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://2e3fe4ce-a757-4e17-9e81-0d6703d588b8-00-lbpg0j4szx7x.worf.replit.dev/pricing?checkout=cancel", "expires_at": 1780386485, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://2e3fe4ce-a757-4e17-9e81-0d6703d588b8-00-lbpg0j4szx7x.worf.replit.dev/account?checkout=success", "amount_total": 2900, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": null, "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 2900, "adaptive_pricing": {"enabled": true}, "after_expiration": null, "customer_account": null, "customer_details": {"name": null, "email": "bigfranknitty05@gmail.com", "phone": null, "address": null, "tax_ids": null, "tax_exempt": "none", "business_name": null, "individual_name": null}, "invoice_creation": null, "managed_payments": {"enabled": false}, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "Asset Manager Sandbox", "background_color": "#ffffff"}, "customer_creation": null, "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card"], "allow_promotion_codes": true, "collected_information": {"business_name": null, "individual_name": null, "shipping_details": null}, "integration_identifier": null, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 16:01:46.24045+00	2026-06-01 16:01:46.239+00	{"id": "cs_test_b1HIeRIzjusJrOCMk82vcVXAyQhzIFYk9cDL4WE0L4n4fk97ZkohL4okhv", "url": "https://checkout.stripe.com/c/pay/cs_test_b1HIeRIzjusJrOCMk82vcVXAyQhzIFYk9cDL4WE0L4n4fk97ZkohL4okhv#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdicGRmZGhqaWBTZHdsZGtxJz8nZmprcXdqaScpJ2R1bE5gfCc%2FJ3VuWnFgdnFaMDRRYUw2V0lhM3N%2Fb09MNkRzSUBsM2lvdFZIUTFyUl9yaX00Q0xyNFdfbE5ddH03ZHVxTGl1dWRjUHBINE43RlBPR21JY0gyN0s3dmtKdlAwbHBCSTZ%2FTmc1NTI1QE1NU2pAJyknY3dqaFZgd3Ngdyc%2FcXdwYCknZ2RmbmJ3anBrYUZqaWp3Jz8nJmNjY2NjYycpJ2lkfGpwcVF8dWAnPydocGlxbFpscWBoJyknYGtkZ2lgVWlkZmBtamlhYHd2Jz9xd3BgeCUl", "mode": "subscription", "locale": null, "object": "checkout.session", "status": "open", "consent": null, "created": 1780300122, "invoice": null, "ui_mode": "hosted_page", "currency": "usd", "customer": "cus_UcfvvXJY9oq9zR", "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://2e3fe4ce-a757-4e17-9e81-0d6703d588b8-00-lbpg0j4szx7x.worf.replit.dev/pricing?checkout=cancel", "expires_at": 1780386522, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://2e3fe4ce-a757-4e17-9e81-0d6703d588b8-00-lbpg0j4szx7x.worf.replit.dev/account?checkout=success", "amount_total": 1999, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": null, "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 1999, "adaptive_pricing": {"enabled": true}, "after_expiration": null, "customer_account": null, "customer_details": {"name": null, "email": "bigfranknitty05@gmail.com", "phone": null, "address": null, "tax_ids": null, "tax_exempt": "none", "business_name": null, "individual_name": null}, "invoice_creation": null, "managed_payments": {"enabled": false}, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "Asset Manager Sandbox", "background_color": "#ffffff"}, "customer_creation": null, "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card"], "allow_promotion_codes": true, "collected_information": {"business_name": null, "individual_name": null, "shipping_details": null}, "integration_identifier": null, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": null}	acct_1TdI3RLd6vzjJI3A
2026-07-07 07:50:15.84901+00	2026-07-07 07:50:15.848+00	{"id": "cs_test_a1XVcCQmLbNuoJfTpyy4uNl9q4md7ECQ657LOgJC5Jxue7isTO8ejctWWc", "url": null, "mode": "subscription", "locale": null, "object": "checkout.session", "status": "expired", "consent": null, "created": 1780343464, "invoice": null, "ui_mode": "hosted_page", "currency": "usd", "customer": null, "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://example.com/cancel", "expires_at": 1780429864, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://example.com/success", "amount_total": 4999, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": null, "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 4999, "adaptive_pricing": {"enabled": true}, "after_expiration": null, "customer_account": null, "customer_details": null, "invoice_creation": null, "managed_payments": {"enabled": false}, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "Asset Manager Sandbox", "background_color": "#ffffff"}, "customer_creation": "always", "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card", "klarna", "link", "cashapp", "amazon_pay"], "allow_promotion_codes": null, "collected_information": null, "integration_identifier": null, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": {"id": "pmc_1TdI40Ld6vzjJI3ATzIAzRPY", "parent": null}}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:24.947643+00	2026-06-01 20:02:24.947+00	{"id": "cs_test_a1Ku10TbePrSLagIfDZIPpgAEq5tfMTJjtRBJVkOPcKCfF5qz8toiPutcz", "url": "https://checkout.stripe.com/c/pay/cs_test_a1Ku10TbePrSLagIfDZIPpgAEq5tfMTJjtRBJVkOPcKCfF5qz8toiPutcz#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdicGRmZGhqaWBTZHdsZGtxJz8nZmprcXdqaScpJ2R1bE5gfCc%2FJ3VuWnFgdnFaMDRRYUw2V0lhM3N%2Fb09MNkRzSUBsM2lvdFZIUTFyUl9yaX00Q0xyNFdfbE5ddH03ZHVxTGl1dWRjUHBINE43RlBPR21JY0gyN0s3dmtKdlAwbHBCSTZ%2FTmc1NTI1QE1NU2pAJyknY3dqaFZgd3Ngdyc%2FcXdwYCknZ2RmbmJ3anBrYUZqaWp3Jz8nJmNjY2NjYycpJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl", "mode": "subscription", "locale": null, "object": "checkout.session", "status": "open", "consent": null, "created": 1780343279, "invoice": null, "ui_mode": "hosted_page", "currency": "usd", "customer": null, "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://example.com/cancel", "expires_at": 1780429679, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://example.com/success", "amount_total": 4999, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": null, "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 4999, "adaptive_pricing": {"enabled": true}, "after_expiration": null, "customer_account": null, "customer_details": null, "invoice_creation": null, "managed_payments": {"enabled": false}, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "Asset Manager Sandbox", "background_color": "#ffffff"}, "customer_creation": "always", "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card", "klarna", "link", "cashapp", "amazon_pay"], "allow_promotion_codes": null, "collected_information": null, "integration_identifier": null, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": {"id": "pmc_1TdI40Ld6vzjJI3ATzIAzRPY", "parent": null}}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:24.948515+00	2026-06-01 20:02:24.947+00	{"id": "cs_test_b1UtoXWIwz3KSjqJtRqaYVVJWvk3SuvPFNjhHRxffOHQF3sarQ1g2KSKoD", "url": "https://checkout.stripe.com/c/pay/cs_test_b1UtoXWIwz3KSjqJtRqaYVVJWvk3SuvPFNjhHRxffOHQF3sarQ1g2KSKoD#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdicGRmZGhqaWBTZHdsZGtxJz8nZmprcXdqaScpJ2R1bE5gfCc%2FJ3VuWnFgdnFaMDRRYUw2V0lhM3N%2Fb09MNkRzSUBsM2lvdFZIUTFyUl9yaX00Q0xyNFdfbE5ddH03ZHVxTGl1dWRjUHBINE43RlBPR21JY0gyN0s3dmtKdlAwbHBCSTZ%2FTmc1NTI1QE1NU2pAJyknY3dqaFZgd3Ngdyc%2FcXdwYCknZ2RmbmJ3anBrYUZqaWp3Jz8nJmNjY2NjYycpJ2lkfGpwcVF8dWAnPydocGlxbFpscWBoJyknYGtkZ2lgVWlkZmBtamlhYHd2Jz9xd3BgeCUl", "mode": "subscription", "locale": null, "object": "checkout.session", "status": "open", "consent": null, "created": 1780310378, "invoice": null, "ui_mode": "hosted_page", "currency": "usd", "customer": null, "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://example.com/pricing?checkout=cancel", "expires_at": 1780396778, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://example.com/account?checkout=success", "amount_total": 2900, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": "e2e-test@example.com", "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 2900, "adaptive_pricing": {"enabled": true}, "after_expiration": null, "customer_account": null, "customer_details": {"name": null, "email": "e2e-test@example.com", "phone": null, "address": null, "tax_ids": null, "tax_exempt": "none", "business_name": null, "individual_name": null}, "invoice_creation": null, "managed_payments": {"enabled": false}, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "Asset Manager Sandbox", "background_color": "#ffffff"}, "customer_creation": "always", "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card"], "allow_promotion_codes": true, "collected_information": {"business_name": null, "individual_name": null, "shipping_details": null}, "integration_identifier": null, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": null}	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.coupons (_updated_at, _last_synced_at, _raw_data) FROM stdin;
\.


--
-- Data for Name: credit_notes; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.credit_notes (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.customers (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2026-07-07 07:50:13.994726+00	2026-07-07 07:50:13.993+00	{"id": "cus_UcfvvXJY9oq9zR", "name": null, "email": "bigfranknitty05@gmail.com", "phone": null, "object": "customer", "address": null, "balance": 0, "created": 1780300083, "currency": null, "discount": null, "livemode": false, "metadata": {"userId": "user_3EWh5HzzbFxsvBuHLoLSWqgQZV7"}, "shipping": null, "delinquent": false, "tax_exempt": "none", "test_clock": null, "description": null, "default_source": null, "invoice_prefix": "LBEZCFHC", "customer_account": null, "invoice_settings": {"footer": null, "custom_fields": null, "rendering_options": null, "default_payment_method": null}, "preferred_locales": [], "next_invoice_sequence": 1}	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.disputes (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: early_fraud_warnings; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.early_fraud_warnings (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.events (_updated_at, _last_synced_at, _raw_data) FROM stdin;
\.


--
-- Data for Name: features; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.features (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.invoices (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: payment_intents; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.payment_intents (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.payment_methods (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.payouts (_updated_at, _last_synced_at, _raw_data) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.plans (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2026-06-01 06:26:47.055682+00	2026-06-01 06:26:47.051+00	{"id": "price_1TdPEpLd6vzjJI3AIKJaRPvu", "meter": null, "active": true, "amount": 2900, "object": "plan", "created": 1780294935, "product": "prod_UceX3wD8Gp8mXq", "currency": "usd", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "2900", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 06:40:19.647863+00	2026-06-01 06:40:19.647+00	{"id": "price_1TdPEqLd6vzjJI3AXxDJxPxm", "meter": null, "active": true, "amount": 7900, "object": "plan", "created": 1780294936, "product": "prod_UceXLsVuKRKzvW", "currency": "usd", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "7900", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1TdI3RLd6vzjJI3A
2026-07-07 07:50:13.814908+00	2026-07-07 07:50:13.814+00	{"id": "price_1TdbmOLd6vzjJI3AlPqU7K9G", "meter": null, "active": true, "amount": 9999, "object": "plan", "created": 1780343144, "product": "prod_UceXLsVuKRKzvW", "currency": "usd", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "9999", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:22.827716+00	2026-06-01 20:02:22.827+00	{"id": "price_1TdbmNLd6vzjJI3AB3zbgBsY", "meter": null, "active": true, "amount": 4999, "object": "plan", "created": 1780343143, "product": "prod_UceX3wD8Gp8mXq", "currency": "usd", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "4999", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:22.827802+00	2026-06-01 20:02:22.827+00	{"id": "price_1TdPVXLd6vzjJI3AQP0KKgHF", "meter": null, "active": true, "amount": 1999, "object": "plan", "created": 1780295971, "product": "prod_UcepTHBho2asMC", "currency": "usd", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "1999", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: prices; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.prices (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2026-06-01 06:26:46.894334+00	2026-06-01 06:26:46.893+00	{"id": "price_1TdPEpLd6vzjJI3AIKJaRPvu", "type": "recurring", "active": true, "object": "price", "created": 1780294935, "product": "prod_UceX3wD8Gp8mXq", "currency": "usd", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 2900, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "2900"}	acct_1TdI3RLd6vzjJI3A
2026-06-01 06:40:19.494068+00	2026-06-01 06:40:19.493+00	{"id": "price_1TdPEqLd6vzjJI3AXxDJxPxm", "type": "recurring", "active": true, "object": "price", "created": 1780294936, "product": "prod_UceXLsVuKRKzvW", "currency": "usd", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 7900, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "7900"}	acct_1TdI3RLd6vzjJI3A
2026-07-07 07:50:13.66875+00	2026-07-07 07:50:13.668+00	{"id": "price_1TdbmOLd6vzjJI3AlPqU7K9G", "type": "recurring", "active": true, "object": "price", "created": 1780343144, "product": "prod_UceXLsVuKRKzvW", "currency": "usd", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 9999, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "9999"}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:22.646733+00	2026-06-01 20:02:22.646+00	{"id": "price_1TdbmNLd6vzjJI3AB3zbgBsY", "type": "recurring", "active": true, "object": "price", "created": 1780343143, "product": "prod_UceX3wD8Gp8mXq", "currency": "usd", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 4999, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "4999"}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:02:22.655065+00	2026-06-01 20:02:22.646+00	{"id": "price_1TdPVXLd6vzjJI3AQP0KKgHF", "type": "recurring", "active": true, "object": "price", "created": 1780295971, "product": "prod_UcepTHBho2asMC", "currency": "usd", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 1999, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "1999"}	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.products (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2026-06-01 20:13:57.019169+00	2026-06-01 20:13:55+00	{"id": "prod_UceXLsVuKRKzvW", "url": null, "name": "Business", "type": "service", "active": true, "images": ["https://files.stripe.com/links/MDB8YWNjdF8xVGRJM1JMZDZ2empKSTNBfGZsX3Rlc3RfbVNwakhpRXZjeEhQSTFCM1dVZ21hWFc400QW2zS1BL"], "object": "product", "created": 1780294936, "updated": 1780344835, "livemode": false, "metadata": {"tier": "business"}, "tax_code": "txcd_10103000", "shippable": null, "attributes": [], "unit_label": null, "description": "For teams that need more — everything in Pro with higher limits and priority generation.", "tax_details": {"tax_code": "txcd_10103000", "performance_location": null}, "default_price": "price_1TdbmOLd6vzjJI3AlPqU7K9G", "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1TdI3RLd6vzjJI3A
2026-06-01 20:13:56.502978+00	2026-06-01 20:13:54+00	{"id": "prod_UceX3wD8Gp8mXq", "url": null, "name": "Pro", "type": "service", "active": true, "images": ["https://files.stripe.com/links/MDB8YWNjdF8xVGRJM1JMZDZ2empKSTNBfGZsX3Rlc3RfT3NTcE9tckdBUExKZ3JmRFBlTG5Za29C00A7j0M0tm"], "object": "product", "created": 1780294935, "updated": 1780344834, "livemode": false, "metadata": {"tier": "pro"}, "tax_code": "txcd_10103000", "shippable": null, "attributes": [], "unit_label": null, "description": "For individuals shipping real work — full access to AI chat, the App Builder, Video Studio, and the Social Hub.", "tax_details": {"tax_code": "txcd_10103000", "performance_location": null}, "default_price": "price_1TdbmNLd6vzjJI3AB3zbgBsY", "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1TdI3RLd6vzjJI3A
2026-07-07 07:50:13.502904+00	2026-07-07 07:50:13.502+00	{"id": "prod_UcepTHBho2asMC", "url": null, "name": "Basic", "type": "service", "active": true, "images": ["https://files.stripe.com/links/MDB8YWNjdF8xVGRJM1JMZDZ2empKSTNBfGZsX3Rlc3RfQThCUXBReWltdDA3R2hDTGVWcUZTeWRk004UVqyntq"], "object": "product", "created": 1780295970, "updated": 1780344834, "livemode": false, "metadata": {"tier": "basic"}, "tax_code": "txcd_10103000", "shippable": null, "attributes": [], "unit_label": null, "description": "For getting started — full app access with a monthly allowance of 100 AI actions. Upgrade anytime for unlimited.", "tax_details": {"tax_code": "txcd_10103000", "performance_location": null}, "default_price": "price_1TdPVXLd6vzjJI3AQP0KKgHF", "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1TdI3RLd6vzjJI3A
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.refunds (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.reviews (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: setup_intents; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.setup_intents (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: subscription_items; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.subscription_items (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: subscription_schedules; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.subscription_schedules (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.subscriptions (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: tax_ids; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.tax_ids (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', 16, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 37, true);


--
-- Name: sent_emails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sent_emails_id_seq', 1, false);


--
-- Name: social_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.social_accounts_id_seq', 1, false);


--
-- Name: social_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.social_posts_id_seq', 1, false);


--
-- Name: usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usage_id_seq', 63, true);


--
-- Name: _sync_status_id_seq; Type: SEQUENCE SET; Schema: stripe; Owner: -
--

SELECT pg_catalog.setval('stripe._sync_status_id_seq', 1086, true);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: sent_emails sent_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_emails
    ADD CONSTRAINT sent_emails_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);


--
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);


--
-- Name: usage usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage
    ADD CONSTRAINT usage_pkey PRIMARY KEY (id);


--
-- Name: usage usage_user_period_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage
    ADD CONSTRAINT usage_user_period_unique UNIQUE (user_id, period);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _migrations _migrations_name_key; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_name_key UNIQUE (name);


--
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);


--
-- Name: _sync_status _sync_status_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._sync_status
    ADD CONSTRAINT _sync_status_pkey PRIMARY KEY (id);


--
-- Name: _sync_status _sync_status_resource_account_key; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._sync_status
    ADD CONSTRAINT _sync_status_resource_account_key UNIQUE (resource, account_id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: active_entitlements active_entitlements_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.active_entitlements
    ADD CONSTRAINT active_entitlements_pkey PRIMARY KEY (id);


--
-- Name: charges charges_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.charges
    ADD CONSTRAINT charges_pkey PRIMARY KEY (id);


--
-- Name: checkout_session_line_items checkout_session_line_items_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.checkout_session_line_items
    ADD CONSTRAINT checkout_session_line_items_pkey PRIMARY KEY (id);


--
-- Name: checkout_sessions checkout_sessions_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.checkout_sessions
    ADD CONSTRAINT checkout_sessions_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: credit_notes credit_notes_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.credit_notes
    ADD CONSTRAINT credit_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: early_fraud_warnings early_fraud_warnings_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.early_fraud_warnings
    ADD CONSTRAINT early_fraud_warnings_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: _managed_webhooks managed_webhooks_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._managed_webhooks
    ADD CONSTRAINT managed_webhooks_pkey PRIMARY KEY (id);


--
-- Name: _managed_webhooks managed_webhooks_url_account_unique; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._managed_webhooks
    ADD CONSTRAINT managed_webhooks_url_account_unique UNIQUE (url, account_id);


--
-- Name: payment_intents payment_intents_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.payment_intents
    ADD CONSTRAINT payment_intents_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: prices prices_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: setup_intents setup_intents_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.setup_intents
    ADD CONSTRAINT setup_intents_pkey PRIMARY KEY (id);


--
-- Name: subscription_items subscription_items_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.subscription_items
    ADD CONSTRAINT subscription_items_pkey PRIMARY KEY (id);


--
-- Name: subscription_schedules subscription_schedules_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.subscription_schedules
    ADD CONSTRAINT subscription_schedules_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tax_ids tax_ids_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.tax_ids
    ADD CONSTRAINT tax_ids_pkey PRIMARY KEY (id);


--
-- Name: active_entitlements_lookup_key_key; Type: INDEX; Schema: stripe; Owner: -
--

CREATE UNIQUE INDEX active_entitlements_lookup_key_key ON stripe.active_entitlements USING btree (lookup_key) WHERE (lookup_key IS NOT NULL);


--
-- Name: features_lookup_key_key; Type: INDEX; Schema: stripe; Owner: -
--

CREATE UNIQUE INDEX features_lookup_key_key ON stripe.features USING btree (lookup_key) WHERE (lookup_key IS NOT NULL);


--
-- Name: idx_accounts_api_key_hashes; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX idx_accounts_api_key_hashes ON stripe.accounts USING gin (api_key_hashes);


--
-- Name: idx_accounts_business_name; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX idx_accounts_business_name ON stripe.accounts USING btree (business_name);


--
-- Name: idx_sync_status_resource_account; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX idx_sync_status_resource_account ON stripe._sync_status USING btree (resource, account_id);


--
-- Name: stripe_active_entitlements_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_active_entitlements_customer_idx ON stripe.active_entitlements USING btree (customer);


--
-- Name: stripe_active_entitlements_feature_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_active_entitlements_feature_idx ON stripe.active_entitlements USING btree (feature);


--
-- Name: stripe_checkout_session_line_items_price_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_checkout_session_line_items_price_idx ON stripe.checkout_session_line_items USING btree (price);


--
-- Name: stripe_checkout_session_line_items_session_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_checkout_session_line_items_session_idx ON stripe.checkout_session_line_items USING btree (checkout_session);


--
-- Name: stripe_checkout_sessions_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_checkout_sessions_customer_idx ON stripe.checkout_sessions USING btree (customer);


--
-- Name: stripe_checkout_sessions_invoice_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_checkout_sessions_invoice_idx ON stripe.checkout_sessions USING btree (invoice);


--
-- Name: stripe_checkout_sessions_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_checkout_sessions_payment_intent_idx ON stripe.checkout_sessions USING btree (payment_intent);


--
-- Name: stripe_checkout_sessions_subscription_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_checkout_sessions_subscription_idx ON stripe.checkout_sessions USING btree (subscription);


--
-- Name: stripe_credit_notes_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_credit_notes_customer_idx ON stripe.credit_notes USING btree (customer);


--
-- Name: stripe_credit_notes_invoice_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_credit_notes_invoice_idx ON stripe.credit_notes USING btree (invoice);


--
-- Name: stripe_dispute_created_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_dispute_created_idx ON stripe.disputes USING btree (created);


--
-- Name: stripe_early_fraud_warnings_charge_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_early_fraud_warnings_charge_idx ON stripe.early_fraud_warnings USING btree (charge);


--
-- Name: stripe_early_fraud_warnings_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_early_fraud_warnings_payment_intent_idx ON stripe.early_fraud_warnings USING btree (payment_intent);


--
-- Name: stripe_invoices_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_invoices_customer_idx ON stripe.invoices USING btree (customer);


--
-- Name: stripe_invoices_subscription_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_invoices_subscription_idx ON stripe.invoices USING btree (subscription);


--
-- Name: stripe_managed_webhooks_enabled_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_managed_webhooks_enabled_idx ON stripe._managed_webhooks USING btree (enabled);


--
-- Name: stripe_managed_webhooks_status_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_managed_webhooks_status_idx ON stripe._managed_webhooks USING btree (status);


--
-- Name: stripe_payment_intents_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_payment_intents_customer_idx ON stripe.payment_intents USING btree (customer);


--
-- Name: stripe_payment_intents_invoice_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_payment_intents_invoice_idx ON stripe.payment_intents USING btree (invoice);


--
-- Name: stripe_payment_methods_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_payment_methods_customer_idx ON stripe.payment_methods USING btree (customer);


--
-- Name: stripe_refunds_charge_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_refunds_charge_idx ON stripe.refunds USING btree (charge);


--
-- Name: stripe_refunds_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_refunds_payment_intent_idx ON stripe.refunds USING btree (payment_intent);


--
-- Name: stripe_reviews_charge_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_reviews_charge_idx ON stripe.reviews USING btree (charge);


--
-- Name: stripe_reviews_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_reviews_payment_intent_idx ON stripe.reviews USING btree (payment_intent);


--
-- Name: stripe_setup_intents_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_setup_intents_customer_idx ON stripe.setup_intents USING btree (customer);


--
-- Name: stripe_tax_ids_customer_idx; Type: INDEX; Schema: stripe; Owner: -
--

CREATE INDEX stripe_tax_ids_customer_idx ON stripe.tax_ids USING btree (customer);


--
-- Name: _managed_webhooks handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe._managed_webhooks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_metadata();


--
-- Name: _sync_status handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe._sync_status FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_metadata();


--
-- Name: accounts handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: active_entitlements handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.active_entitlements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: charges handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.charges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: checkout_session_line_items handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.checkout_session_line_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: checkout_sessions handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.checkout_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: coupons handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: customers handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: disputes handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: early_fraud_warnings handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.early_fraud_warnings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: events handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: features handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.features FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: payouts handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.payouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: plans handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: prices handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.prices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: refunds handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.refunds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reviews handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: subscriptions handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: -
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: active_entitlements fk_active_entitlements_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.active_entitlements
    ADD CONSTRAINT fk_active_entitlements_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: charges fk_charges_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.charges
    ADD CONSTRAINT fk_charges_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: checkout_session_line_items fk_checkout_session_line_items_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.checkout_session_line_items
    ADD CONSTRAINT fk_checkout_session_line_items_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: checkout_sessions fk_checkout_sessions_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.checkout_sessions
    ADD CONSTRAINT fk_checkout_sessions_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: credit_notes fk_credit_notes_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.credit_notes
    ADD CONSTRAINT fk_credit_notes_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: customers fk_customers_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.customers
    ADD CONSTRAINT fk_customers_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: disputes fk_disputes_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.disputes
    ADD CONSTRAINT fk_disputes_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: early_fraud_warnings fk_early_fraud_warnings_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.early_fraud_warnings
    ADD CONSTRAINT fk_early_fraud_warnings_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: features fk_features_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.features
    ADD CONSTRAINT fk_features_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: invoices fk_invoices_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.invoices
    ADD CONSTRAINT fk_invoices_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: _managed_webhooks fk_managed_webhooks_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._managed_webhooks
    ADD CONSTRAINT fk_managed_webhooks_account FOREIGN KEY (account_id) REFERENCES stripe.accounts(id);


--
-- Name: payment_intents fk_payment_intents_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.payment_intents
    ADD CONSTRAINT fk_payment_intents_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: payment_methods fk_payment_methods_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.payment_methods
    ADD CONSTRAINT fk_payment_methods_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: plans fk_plans_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.plans
    ADD CONSTRAINT fk_plans_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: prices fk_prices_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT fk_prices_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: products fk_products_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.products
    ADD CONSTRAINT fk_products_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: refunds fk_refunds_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.refunds
    ADD CONSTRAINT fk_refunds_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: reviews fk_reviews_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.reviews
    ADD CONSTRAINT fk_reviews_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: setup_intents fk_setup_intents_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.setup_intents
    ADD CONSTRAINT fk_setup_intents_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: subscription_items fk_subscription_items_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.subscription_items
    ADD CONSTRAINT fk_subscription_items_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: subscription_schedules fk_subscription_schedules_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.subscription_schedules
    ADD CONSTRAINT fk_subscription_schedules_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: subscriptions fk_subscriptions_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.subscriptions
    ADD CONSTRAINT fk_subscriptions_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: _sync_status fk_sync_status_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._sync_status
    ADD CONSTRAINT fk_sync_status_account FOREIGN KEY (account_id) REFERENCES stripe.accounts(id);


--
-- Name: tax_ids fk_tax_ids_account; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.tax_ids
    ADD CONSTRAINT fk_tax_ids_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- PostgreSQL database dump complete
--

\unrestrict JhcWu3zSRZUZBQmbDPoHjyBqLhJc23qpxyzE1i6saTungKEWnN3bvkjLDyakY5E

