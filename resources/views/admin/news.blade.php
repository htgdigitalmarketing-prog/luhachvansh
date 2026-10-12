@extends('admin.layout')

@section('content')

<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main">
    <div class="container-fluid">
        <div class="fade-in">
            <div class="row">
            <div class="col-md-12">
            <div class="card">
                <div class="card-body"><h1>Recent News</h1>
            <hr>
            <div class="row">
            <div class="col-md-6">
                <form id="signupForm" method="POST" action="{{route('store_news')}}">
                    @csrf
                    <div class="form-group">
                    <label class="col-form-label" for="news">News Title</label>
                        <input class="form-control" type="text" name="news_title" placeholder="Enter News Title Here" id="">
                  
                    <label class="col-form-label" for="firstname">News</label>
                        <textarea class="form-control" id="news" type="text" name="news" placeholder="Enter News Here"></textarea>
                    </div>
                    </div>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" type="submit" name="signup" value="Submit">Submit</button>
                    </div>
                </form>
            </div>
            </div>
            </div>
            </div>
    </div>

    <div class="container-fluid">
    <div class="fade-in">
    <div class="card">
    <div class="card-header"> All News
    </div>
    <div class="card-body">
    <table class="table table-striped table-bordered datatable">
    <thead>
    <tr>
    <th>Sr. No.</th>
    <th>News Title</th>
    <th>News</th>
    <th>Actions</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_news as $key=>$data)
    <tr>
        <td>{{$key+1}}</td>
        <td>{{$data->news_title}}</td>
        <td>{{$data->news}}</td>
        <td>
            <a class="btn btn-info" href="{{url('news/update/'.$data->id)}}">Update</a>
            <a class="btn btn-danger" href="{{url('news/delete/'.$data->id)}}">Delete</a>
        </td>
    </tr>
    @endforeach
   
    </main>

<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>
@endsection