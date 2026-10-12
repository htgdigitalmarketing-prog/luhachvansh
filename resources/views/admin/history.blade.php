@extends('admin.layout')

@section('content')

<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main">
    <div class="container-fluid">
        <div class="fade-in">
            <div class="row">
            <div class="col-md-12">
            <div class="card">
                <div class="card-body"><h1>History</h1>
            <hr>
            <div class="row">
            <div class="col-md-12">
                <form id="signupForm" method="POST" action="{{url('hist/update')}}">
                    @csrf
                    <div class="form-group">
                        <label class="col-form-label" for="firstname">History</label>
                        <textarea id="summernote" class="form-control" type="text" name="history" cols="100" rows="20" placeholder="Enter News Here" >{{$get_hist->history}}</textarea>
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
   
    </main>

<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>

<script src="https://code.jquery.com/jquery-3.5.1.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

<link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-bs4.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-bs4.min.js"></script>

<script>
    $('#summernote').summernote({
      tabsize: 10,
      height: 2000
    });
</script>
@endsection