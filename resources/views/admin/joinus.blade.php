@extends('admin.layout')

@section('content')

<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main">

    <div class="container-fluid">
    <div class="fade-in">
    <div class="card">
    <div class="card-header"> Join Us
    </div>
    <div class="card-body">
    <table class="table table-striped table-bordered datatable">
    <thead>
    <tr>
    <th>Sr. No.</th>
    <th>Name</th>
    <th>Father Name</th>
    <th>Age</th>
    <th>Profession</th>
    <th>Contact No.</th>
    <th>E-Mail</th>
    <th>Subject</th>
    <th>Message</th>
    <th>Actions</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_join_us as $key=>$data)
    <tr>
        <td>{{$key+1}}</td>
        <td>{{$data->name}}</td>
        <td>{{$data->father_name}}</td>
        <td>{{$data->age}}</td>
        <td>{{$data->profession}}</td>
        <td>{{$data->contact_number}}</td>
        <td>{{$data->email}}</td>
        <td>{{$data->subject}}</td>
        <td>{{$data->message}}</td>
        <td>
            <a class="btn btn-success" href="{{url('join_us/approve/'.$data->id)}}">Approve</a>
            <a class="btn btn-danger" href="{{url('join_us/delete/'.$data->id)}}">Delete</a>
        </td>
    </tr>
    @endforeach
   
    </main>

<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>
@endsection